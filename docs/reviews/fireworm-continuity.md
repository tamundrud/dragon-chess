# Fireworm continuous blast — review evidence

> Historical implementation record. Fireworm visual objections are resolved by [owner approval on PR #16](../FIREWORM_BENCHMARK.md). See [current integration verification](fireworm-integration.md) for technical results.

This follows the owner’s PR #15 feedback. The primary flame ribbons are in a layer above the defender and stretch from the moving mouth to the target; their width grows at contact and their alpha fades for the soot/dazed reveal. The former independent impact flames are removed. Fireworks and smoke remain separate ambient effects. Board and arena use the same breath.

## Full-sequence recordings

The production preview was clock-stepped by 33 ms per captured canvas frame and encoded at 30 fps. Each Normal clip has 104 frames and each Fast clip 37. These are deterministic render samples, not physical-phone performance recordings. All 16 frame sequences were inspected as ordered contact sheets, from arrival through return, including emergence, approach, contact, expansion and clearing. The painted fire remains attached to the mouth in these samples and crosses the defender in the foreground without a separately appearing impact flame. Owner judgment of visual quality on a physical phone remains pending.

| Defender and view | Board Normal | Board Fast | Arena Normal | Arena Fast |
| --- | --- | --- | --- | --- |
| pawn · phone-360-portrait | [Watch](artifacts/fireworm-continuity/phone-360-portrait-pawn-board-normal.mp4) | [Watch](artifacts/fireworm-continuity/phone-360-portrait-pawn-board-fast.mp4) | [Watch](artifacts/fireworm-continuity/phone-360-portrait-pawn-arena-normal.mp4) | [Watch](artifacts/fireworm-continuity/phone-360-portrait-pawn-arena-fast.mp4) |
| rook · phone-360-portrait | [Watch](artifacts/fireworm-continuity/phone-360-portrait-rook-board-normal.mp4) | [Watch](artifacts/fireworm-continuity/phone-360-portrait-rook-board-fast.mp4) | [Watch](artifacts/fireworm-continuity/phone-360-portrait-rook-arena-normal.mp4) | [Watch](artifacts/fireworm-continuity/phone-360-portrait-rook-arena-fast.mp4) |
| pawn · phone-landscape | [Watch](artifacts/fireworm-continuity/phone-landscape-pawn-board-normal.mp4) | [Watch](artifacts/fireworm-continuity/phone-landscape-pawn-board-fast.mp4) | [Watch](artifacts/fireworm-continuity/phone-landscape-pawn-arena-normal.mp4) | [Watch](artifacts/fireworm-continuity/phone-landscape-pawn-arena-fast.mp4) |
| rook · phone-landscape | [Watch](artifacts/fireworm-continuity/phone-landscape-rook-board-normal.mp4) | [Watch](artifacts/fireworm-continuity/phone-landscape-rook-board-fast.mp4) | [Watch](artifacts/fireworm-continuity/phone-landscape-rook-arena-normal.mp4) | [Watch](artifacts/fireworm-continuity/phone-landscape-rook-arena-fast.mp4) |

The frame captures use `scripts/fireworm_continuity_record.js` and `scripts/fireworm-record.config.mjs`; they require FFmpeg with libx264 and a local Chromium. This is intentionally outside ordinary Playwright discovery. In the cloud environment, rerun with `DRAGON_CHESS_CHROMIUM=/usr/bin/chromium npx playwright test --config=scripts/fireworm-record.config.mjs --project=phone-360-portrait --project=phone-landscape --workers=2`. The standard intermediate-frame test also checks peak fire over the defender and clearing, but its individual screenshots alone do not establish continuity. Automated black-frame detection found no fully black frame in the recordings. Frame stepping and software Chromium do not establish real-device smoothness.

## Review and limits

An independent local adversarial review found that initially placing the recorder in the ordinary test suite would introduce an unprovisioned FFmpeg dependency and overwrite artifacts. It was moved out of discovery. The review also identified that intermediate screenshot capture alone was insufficient; the complete frame-stepped recordings above address that evidence gap. No independent cross-model review was performed. The review noted geometry updates end when expansion ends; the current target recoil ends earlier, so no present defect was established.

Owner physical-phone acceptance, comfort, browser bars and performance remain open. No merge or deployment is authorized by this work.
