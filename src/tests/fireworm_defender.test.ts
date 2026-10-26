import { describe, expect, it } from 'vitest';
import { resolveFirewormDefender, defenderFlipX } from '../game/animation/firewormDefender';
const base = { moveFrom:'b3', moveTo:'b6', attackerCharacterId:'fireworm', attackDefinitionId:'fireworm_fireworks' };
describe('Fireworm defender selection', () => {
  it('selects a distinct Flamehuffer only for the matching black rook identity', () => {
    expect(resolveFirewormDefender({...base, defenderCharacterId:'flamehuffer', defenderPieceType:'r', defenderColor:'b'})).toMatchObject({ texture:'flamehuffer', type:'r', color:'b', label: 'FLAMEHUFFER · ROOK' });
    expect(resolveFirewormDefender({...base, defenderCharacterId:'common_or_garden', defenderPieceType:'r', defenderColor:'b'}).texture).toBeUndefined();
    expect(resolveFirewormDefender({...base, defenderCharacterId:'flamehuffer', defenderPieceType:'b', defenderColor:'b'}).texture).toBeUndefined();
  });
  it('uses the raider only for its actual pawn class and faction', () => {
    expect(resolveFirewormDefender({...base, defenderCharacterId:'rival_generic', defenderPieceType:'p', defenderColor:'b'}).frame).toBe('defender');
    const bishop=resolveFirewormDefender({...base, defenderCharacterId:'rival_generic', defenderPieceType:'b', defenderColor:'b'});
    expect(bishop.texture).toBeUndefined(); expect(bishop.label).toContain('BISHOP'); expect(bishop.label).not.toContain('RAIDER');
  });
  it('keeps named unillustrated pieces honest without a pawn disguise', () => {
    const hookfang=resolveFirewormDefender({...base, defenderCharacterId:'hookfang', defenderPieceType:'r', defenderColor:'w'});
    expect(hookfang.texture).toBeUndefined(); expect(hookfang.label).toContain('HOOKFANG'); expect(hookfang.label).toContain('ROOK');
  });
});

describe('defender facing follows the staged attacker', () => {
  it('turns the right-facing pawn toward an attacker on either side', () => {
    const pawn=resolveFirewormDefender({...base,defenderCharacterId:'rival_generic',defenderPieceType:'p',defenderColor:'b'});
    expect(pawn.facing).toBe(1);
    expect(defenderFlipX(pawn.facing!,245,650)).toBe(true);
    expect(defenderFlipX(pawn.facing!,700,200)).toBe(false);
  });
  it('preserves the left-facing rook and flips it when the attacker changes sides', () => {
    const rook=resolveFirewormDefender({...base,defenderCharacterId:'flamehuffer',defenderPieceType:'r',defenderColor:'b'});
    expect(rook.facing).toBe(-1);
    expect(defenderFlipX(rook.facing!,245,650)).toBe(false);
    expect(defenderFlipX(rook.facing!,700,200)).toBe(true);
    expect(resolveFirewormDefender({...base,defenderCharacterId:'hookfang'}).facing).toBeUndefined();
  });
});
