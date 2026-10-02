import { expect, test, type Browser, type Page } from '@playwright/test';

async function createHost(page: Page, name: string) {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /FORGE THE LIE/i })).toBeVisible();
  const createButton = page.getByRole('button', { name: 'Create Room & Get Code' });
  await expect(createButton).toBeDisabled();
  await page.getByPlaceholder('Enter your name...').fill(name);
  await createButton.click();
  await expect(page.getByRole('heading', { name: 'Match Settings' })).toBeVisible();
  const codePanel = await page.locator('button').filter({ hasText: 'Room Code (Tap to Copy)' }).innerText();
  const code = codePanel.match(/\b([A-HJ-NP-Z2-9]{4})\b/)?.[1];
  if (!code) throw new Error(`Could not read the four-character invite code from: ${codePanel}`);
  return code;
}

async function voteCategory(page: Page, categoryName: string) {
  const cardTitle = page.locator('main h3').filter({ hasText: categoryName }).first();
  await expect(cardTitle).toBeVisible();
  await cardTitle.click();
}

async function submitBluff(page: Page, text: string, options: { wager?: string; gambit?: string } = {}) {
  await page.getByPlaceholder('Write a short answer that sounds suspiciously plausible…').fill(text);
  if (options.wager) await page.getByRole('button', { name: new RegExp(options.wager) }).click();
  if (options.gambit) await page.getByRole('button', { name: options.gambit, exact: false }).click();
  await page.getByRole('button', { name: 'Lock Bluff & Wager' }).click();
}

async function chooseVerdict(page: Page, options: { radar?: boolean; kudos?: boolean } = {}) {
  if (options.radar) {
    await page.getByRole('button', { name: 'Scan one fake' }).click();
    await expect(page.getByText('One fake marked on your screen only')).toBeVisible();
  }
  const availableCards = page.locator('main [role="button"]').filter({ hasText: 'Tap to select' });
  await expect(availableCards.first()).toBeVisible();
  await availableCards.first().click();
  if (options.kudos) await page.getByRole('button', { name: 'Golden Lie', exact: false }).first().click();
  await page.getByRole('button', { name: 'Lock verdict' }).click();
}

async function declassifyRound(host: Page, guest: Page) {
  const progress = host.getByText(/^\d+\/\d+ declassified$/);
  const button = host.getByRole('button', { name: /Declassify next card/ });
  let safety = 0;
  while (safety++ < 8) {
    const [revealedText, totalText] = (await progress.innerText()).split(' ')[0].split('/');
    const revealed = Number(revealedText);
    const total = Number(totalText);
    if (revealed >= total) break;
    await button.click();
    await expect(progress).toHaveText(`${revealed + 1}/${total} declassified`);
    await expect(guest.getByText(`${revealed + 1}/${total} declassified`)).toBeVisible();
  }
  if (safety > 8) throw new Error('Reveal did not finish within eight cards.');
  await expect(host.getByRole('button', { name: /Continue to/ })).toBeVisible();
}

async function makeMatchContext(browser: Browser, viewport: { width: number; height: number }, grantClipboard = false) {
  const context = await browser.newContext({ viewport });
  if (grantClipboard) await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  const page = await context.newPage();
  return { context, page };
}

async function noHorizontalOverflow(page: Page) {
  const diagnostics = await page.evaluate(() => {
    const offenders = [...document.querySelectorAll('body *')].map((node) => {
      const rect = node.getBoundingClientRect();
      return { tag: node.tagName, className: (node as HTMLElement).className?.toString().slice(0, 90), text: node.textContent?.trim().slice(0, 35), left: Math.round(rect.left), right: Math.round(rect.right), width: Math.round(rect.width) };
    }).filter((item) => item.right > window.innerWidth + 1 || item.left < -1).slice(0, 12);
    return { viewport: window.innerWidth, scroll: document.documentElement.scrollWidth, offenders };
  });
  if (diagnostics.scroll > diagnostics.viewport) console.log('HORIZONTAL OVERFLOW', JSON.stringify(diagnostics));
  return diagnostics.scroll <= diagnostics.viewport;
}

test('two isolated desktop/mobile browser contexts complete a three-round match, reveal, share, and rematch', async ({ browser }) => {
  const host = await makeMatchContext(browser, { width: 1440, height: 960 }, true);
  const guest = await makeMatchContext(browser, { width: 390, height: 844 });
  const pageErrors: string[] = [];
  host.page.on('pageerror', (error) => pageErrors.push(`host: ${error.message}`));
  guest.page.on('pageerror', (error) => pageErrors.push(`guest: ${error.message}`));

  try {
    const code = await createHost(host.page, 'Ada');
    await host.page.getByRole('button', { name: 'Untimed Mode' }).click();
    await expect(host.page.getByRole('button', { name: 'Untimed Mode' })).toHaveClass(/border-cyan-400/);
    await host.page.getByRole('button', { name: 'Copy Instant Join URL' }).click();
    await expect(host.page.getByText('Direct Join Link Copied!')).toBeVisible();

    await guest.page.goto(`/?room=${code}`);
    await expect(guest.page.getByRole('heading', { name: /FORGE THE LIE/i })).toBeVisible();
    await expect(guest.page.getByLabel('4-Letter Room Code')).toHaveValue(code);
    await guest.page.getByPlaceholder('Enter your name...').fill('Bea');
    await guest.page.getByRole('button', { name: `Join Room ${code}` }).click();
    await expect(guest.page.getByRole('heading', { name: 'Match Settings' })).toBeVisible();
    await guest.page.getByRole('button', { name: 'Tap When Ready!' }).click();
    await expect(host.page.getByRole('button', { name: 'Launch 3-Round Match (2 Players)' })).toBeEnabled();

    // Refresh one device mid-lobby: the secure local session should restore the same player.
    await guest.page.reload();
    await expect(guest.page.getByRole('heading', { name: 'Match Settings' })).toBeVisible();
    await expect(guest.page.getByText('Bea', { exact: true }).first()).toBeVisible();
    expect(await noHorizontalOverflow(guest.page)).toBe(true);

    const reactionResponse = host.page.waitForResponse((response) => {
      if (!response.url().endsWith('/api/game')) return false;
      try { return response.request().postDataJSON()?.action === 'send_reaction'; } catch { return false; }
    });
    await host.page.getByTitle('Send 🔥 reaction to all screens').click();
    const reaction = await reactionResponse;
    expect((await reaction.json()).room.reactions[0].emoji).toBe('🔥');
    await expect(guest.page.locator('.fixed.bottom-20').getByText('Ada', { exact: true })).toBeVisible();

    await host.page.getByRole('button', { name: 'Launch 3-Round Match (2 Players)' }).click();

    for (let round = 1; round <= 3; round++) {
      await expect(host.page.getByRole('heading', { name: /Vote on This Round’s Category/ })).toBeVisible();
      await expect(guest.page.getByRole('heading', { name: /Vote on This Round’s Category/ })).toBeVisible();
      expect(await noHorizontalOverflow(guest.page)).toBe(true);
      const categoryName = (await host.page.locator('main h3').first().innerText()).trim();
      await voteCategory(host.page, categoryName);
      await voteCategory(guest.page, categoryName);

      await expect(host.page.getByRole('heading', { name: /Make the Fake Feel/ })).toBeVisible();
      await expect(guest.page.getByRole('heading', { name: /Make the Fake Feel/ })).toBeVisible();
      expect(await noHorizontalOverflow(guest.page)).toBe(true);
      await submitBluff(host.page, `A moonlit filing cabinet, round ${round}`, {
        ...(round === 1 ? { wager: '2× BOLD', gambit: 'Double Agent' } : round === 3 ? { wager: '3× ALL-IN' } : {}),
      });
      await submitBluff(guest.page, `A velvet submarine permit, round ${round}`, {
        ...(round === 1 ? { gambit: 'Aegis Shield' } : {}),
      });

      await expect(host.page.getByRole('heading', { name: /Which Answer Is the/ })).toBeVisible();
      await expect(guest.page.getByRole('heading', { name: /Which Answer Is the/ })).toBeVisible();
      expect(await noHorizontalOverflow(guest.page)).toBe(true);
      if (round === 1) {
        await chooseVerdict(host.page, { radar: true, kudos: true });
        await expect(guest.page.getByText('One fake marked on your screen only')).toHaveCount(0);
      } else {
        await chooseVerdict(host.page);
      }
      await chooseVerdict(guest.page, { kudos: round === 2 });

      await expect(host.page.getByRole('heading', { name: /The Truth Is/ })).toBeVisible();
      await expect(guest.page.getByRole('heading', { name: /The Truth Is/ })).toBeVisible();
      expect(await noHorizontalOverflow(guest.page)).toBe(true);
      await declassifyRound(host.page, guest.page);
      await host.page.getByRole('button', { name: /Continue to/ }).click();
    }

    await expect(host.page.getByRole('heading', { name: /The Crown Is Claimed|A Championship Draw/ })).toBeVisible();
    await expect(host.page.getByRole('heading', { name: 'Your Mirage Signature' })).toBeVisible();
    expect(await noHorizontalOverflow(guest.page)).toBe(true);
    await expect(host.page.getByText('Round 3', { exact: false }).first()).toBeVisible();
    await expect(host.page.getByRole('button', { name: 'Copy results' })).toBeVisible();
    await host.page.getByRole('button', { name: 'Copy results' }).click();
    await expect(host.page.getByRole('button', { name: 'Copied to clipboard' })).toBeVisible();
    const copied = await host.page.evaluate(() => navigator.clipboard.readText());
    expect(copied).toContain('MIRAGE ROYALE · MATCH FILE');
    expect(copied).toContain('played as');
    expect(copied).toContain('Ada');

    await host.page.getByRole('button', { name: 'Play a rematch' }).click();
    await expect(host.page.getByRole('heading', { name: /Vote on This Round’s Category/ })).toBeVisible();
    expect(pageErrors).toEqual([]);
  } finally {
    await host.context.close();
    await guest.context.close();
  }
});

test('small-screen home, rulebook, AI lobby controls, and room exit stay usable', async ({ browser }) => {
  const { context, page } = await makeMatchContext(browser, { width: 375, height: 812 });
  try {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: /FORGE THE LIE/i })).toBeVisible();
    await page.getByRole('button', { name: 'Read Full Interactive Rulebook' }).click();
    await expect(page.getByRole('heading', { name: 'MIRAGE ROYALE — Official Rulebook' })).toBeVisible();
    await page.getByRole('button', { name: '2. Points & Wagers' }).click();
    await expect(page.getByText(/Truth Streak Bonus/)).toBeVisible();
    await page.getByRole('button', { name: '3. Tactical Gambits' }).click();
    await expect(page.getByRole('heading', { name: /Truth Radar \(Private Fake Filter\)/ })).toBeVisible();
    await page.getByRole('button', { name: 'Close rules' }).click();

    await page.getByPlaceholder('Enter your name...').fill('Rin');
    await page.getByRole('button', { name: 'Create Room & Get Code' }).click();
    await expect(page.getByRole('heading', { name: 'Match Settings' })).toBeVisible();
    await page.getByRole('button', { name: '45s Blitz' }).click();
    await expect(page.getByRole('button', { name: '45s Blitz' })).toHaveClass(/border-cyan-400/);
    await page.getByRole('button', { name: 'Untimed Mode' }).click();
    await expect(page.getByRole('button', { name: 'Untimed Mode' })).toHaveClass(/border-cyan-400/);

    await page.getByRole('button', { name: '+ Add AI Challenger' }).click();
    await expect(page.getByText('Connected Players (2 / 8)')).toBeVisible();
    await expect(page.getByText('AI', { exact: true })).toBeVisible();
    await page.getByTitle('Remove player').click();
    await expect(page.getByText('Connected Players (1 / 8)')).toBeVisible();

    expect(await noHorizontalOverflow(page)).toBe(true);
    await page.getByTitle('Leave Room').click();
    await expect(page.getByRole('heading', { name: /FORGE THE LIE/i })).toBeVisible();
  } finally {
    await context.close();
  }
});
