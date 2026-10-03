// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { renderMarkdown } from './markdown';

describe('renderMarkdown', () => {
  it('renderMarkdown_titreEtGras_produitDuHtml', () => {
    const html = renderMarkdown('# Titre\n\n**gras**');
    expect(html).toContain('<h1');
    expect(html).toContain('<strong>gras</strong>');
  });

  it('renderMarkdown_imgAvecOnerror_retireLeGestionnaire', () => {
    const html = renderMarkdown('<img src=x onerror="alert(1)">');
    expect(html).not.toMatch(/onerror/i);
  });

  it('renderMarkdown_scriptEnLigne_leSupprime', () => {
    const html = renderMarkdown('avant <script>alert(1)</script> après');
    expect(html).not.toMatch(/<script/i);
  });

  it('renderMarkdown_lienJavascript_neGardePasLeProtocole', () => {
    const html = renderMarkdown('[clic](javascript:alert(1))');
    expect(html).not.toMatch(/javascript:/i);
  });

  it('renderMarkdown_iframeEtStyleInline_lesSupprime', () => {
    const html = renderMarkdown('<iframe src="https://evil.test"></iframe><p style="color:red">x</p>');
    expect(html).not.toMatch(/<iframe/i);
    expect(html).not.toMatch(/style=/i);
  });

  it('renderMarkdown_erreurDeRendu_echappeLeMessage', () => {
    const html = renderMarkdown(undefined as unknown as string);
    expect(html).not.toMatch(/<img|<script/i);
    expect(html).toContain('Erreur de rendu');
  });
});
