import { describe, expect, it } from 'vitest';
import { parseCron } from './cron';

const summary = (e: string) => parseCron(e).summary;

describe('parseCron', () => {
  it('parseCron_semaineA9h_expliqueLaPlage', () => {
    const r = parseCron('0 9 * * 1-5');
    expect(r.error).toBe('');
    expect(r.summary).toBe('à 9h, du lun au ven.');
  });
  it('parseCron_quatreChamps_signaleLErreur', () => {
    expect(parseCron('* * * *').error).toMatch(/5 champs/);
  });
  it('parseCron_minuteSimple_afficheDeuxChiffres', () => {
    expect(summary('5 9 * * *')).toBe('à 9h05.');
    expect(summary('30 3 * * 0')).toBe('à 3h30, le dim.');
    expect(summary('0 9 * * *')).toBe('à 9h.');
  });
  it('parseCron_listeDHeuresAvecMinute_afficheDeuxChiffres', () => {
    expect(summary('5 8,20 * * *')).toBe('à 8h05 et 20h05.');
  });
  it('parseCron_pasSurLesHeures_estExplique', () => {
    expect(summary('0 */2 * * *')).toBe('toutes les 2 heures.');
    expect(summary('15 */2 * * *')).toBe('toutes les 2 heures, à la minute 15.');
  });
  it('parseCron_pasMinutesEtHeureFixe_conserveLaContrainteDHeure', () => {
    expect(summary('*/5 9 * * *')).toBe("toutes les 5 minutes, pendant l'heure de 9h.");
  });
  it('parseCron_pasMinutesSansHeure_resteSimple', () => {
    expect(summary('*/5 * * * *')).toBe('toutes les 5 minutes.');
  });
  it('parseCron_plageAvecPas_estValideEtExpliquee', () => {
    const r = parseCron('0 9-17/2 * * *');
    expect(r.fields[1].error).toBe('');
    expect(r.fields[1].label).toBe('toutes les 2 heures de 9h à 17h');
  });
  it('parseCron_plageDeUneValeur_estValide', () => {
    expect(parseCron('5-5 * * * *').fields[0].error).toBe('');
  });
  it('parseCron_plageInversee_estRefusee', () => {
    expect(parseCron('10-5 * * * *').fields[0].error).toMatch(/Plage invalide/);
  });
  it('parseCron_pasHorsBorne_estRefuse', () => {
    expect(parseCron('*/0 * * * *').fields[0].error).not.toBe('');
    expect(parseCron('*/99 * * * *').fields[0].error).not.toBe('');
  });
  it('parseCron_listeContenantUnePlage_estExpliquee', () => {
    const f = parseCron('0 0 * * 1-3,5').fields[4];
    expect(f.error).toBe('');
    expect(f.label).toBe('du lun au mer, le ven');
  });
  it('parseCron_nomsDeJoursEtDeMois_sontAcceptes', () => {
    const r = parseCron('0 9 * JAN MON-FRI');
    expect(r.fields.every((f) => f.error === '')).toBe(true);
    expect(r.summary).toBe('à 9h, du lun au ven, en jan.');
  });
  it('parseCron_aliasDaily_estDeveloppe', () => {
    expect(summary('@daily')).toBe('à 0h.');
  });
});
