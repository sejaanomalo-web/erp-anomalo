// Templates simples em HTML inline. Tema light (Gmail M3) com Roboto.

function layout(titulo: string, corpoHtml: string) {
  return `<!doctype html>
<html lang="pt-BR">
  <body style="background:#f6f8fc;color:#1f1f1f;font-family:Roboto,system-ui,sans-serif;margin:0;padding:40px 24px;">
    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #dadce0;border-radius:12px;padding:32px;">
      <tr>
        <td style="font-size:12px;font-weight:500;color:#5f6368;padding-bottom:12px;">
          Tato Estofados
        </td>
      </tr>
      <tr>
        <td style="font-size:24px;font-weight:500;color:#1f1f1f;padding-bottom:8px;">
          ${titulo}
        </td>
      </tr>
      <tr>
        <td style="height:1px;background:#dadce0;width:100%;display:block;"></td>
      </tr>
      <tr>
        <td style="padding-top:20px;font-size:14px;line-height:1.6;color:#1f1f1f;">
          ${corpoHtml}
        </td>
      </tr>
      <tr>
        <td style="padding-top:24px;font-size:12px;color:#5f6368;border-top:1px solid #dadce0;margin-top:24px;">
          Tato Estofados.
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export function resetSenhaTemplate(opts: { link: string; nome?: string }) {
  return layout(
    "Redefinir senha",
    `<p>${opts.nome ? `Olá, ${opts.nome}.` : "Olá."}</p>
     <p>Para criar uma nova senha, abra o link abaixo. Ele é válido por 24 horas.</p>
     <p><a href="${opts.link}" style="color:#0b57d0;text-decoration:none;border-bottom:1px solid #0b57d0;">Redefinir senha</a></p>
     <p>Se você não pediu, ignore este e-mail.</p>`,
  );
}

export function conviteUsuarioTemplate(opts: {
  link: string;
  empresa: string;
  papel: string;
}) {
  return layout(
    "Acesso ao sistema Tato Estofados",
    `<p>Você foi convidado a acessar o sistema da ${opts.empresa}, como ${opts.papel}.</p>
     <p><a href="${opts.link}" style="color:#0b57d0;text-decoration:none;border-bottom:1px solid #0b57d0;">Criar acesso</a></p>
     <p>O convite expira em 7 dias.</p>`,
  );
}

export function alertaEstoqueTemplate(opts: {
  item: string;
  estoqueAtual: number;
  estoqueMinimo: number;
  unidade?: string;
}) {
  return layout(
    "Estoque crítico",
    `<p>O item <strong style="color:#1f1f1f;">${opts.item}</strong> chegou em ${opts.estoqueAtual} ${opts.unidade ?? "unidades"} (mínimo: ${opts.estoqueMinimo}).</p>
     <p>Vale conferir a reposição.</p>`,
  );
}

export function alertaContaTemplate(opts: {
  descricao: string;
  valor: string;
  vencimento: string;
}) {
  return layout(
    "Conta a vencer",
    `<p>${opts.descricao} no valor de <strong style="color:#1f1f1f;">${opts.valor}</strong> vence em ${opts.vencimento}.</p>`,
  );
}

export function notificacaoVendaTemplate(opts: {
  numero: number;
  cliente: string;
  vendedor: string;
  valor: string;
}) {
  return layout(
    "Venda fechada",
    `<p>O vendedor ${opts.vendedor} registrou a venda <strong style="color:#1f1f1f;">#${opts.numero}</strong> para ${opts.cliente} no valor de ${opts.valor}.</p>`,
  );
}
