// Templates simples em HTML inline. Sem framework de e-mail; cor preto absoluto
// + tipografia sans-serif para coerência com a identidade.

function layout(titulo: string, corpoHtml: string) {
  return `<!doctype html>
<html lang="pt-BR">
  <body style="background:#000;color:#fff;font-family:Inter,system-ui,sans-serif;margin:0;padding:40px 24px;">
    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:560px;margin:0 auto;">
      <tr>
        <td style="font-size:11px;letter-spacing:1.17px;text-transform:uppercase;color:#8a93a3;padding-bottom:16px;">
          ERP Anômalo
        </td>
      </tr>
      <tr>
        <td style="font-size:24px;font-weight:700;letter-spacing:0.04em;text-transform:uppercase;color:#fff;padding-bottom:8px;">
          ${titulo}
        </td>
      </tr>
      <tr>
        <td style="height:1px;background:#C9953A;width:64px;display:block;"></td>
      </tr>
      <tr>
        <td style="padding-top:24px;font-size:14px;line-height:1.6;color:#c7cdd9;">
          ${corpoHtml}
        </td>
      </tr>
      <tr>
        <td style="padding-top:32px;font-size:11px;color:#5b6473;border-top:1px solid rgba(255,255,255,0.06);margin-top:24px;">
          Anômalo Hub.
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export function resetSenhaTemplate(opts: {
  link: string;
  nome?: string;
}) {
  return layout(
    "Redefinir senha",
    `<p>${opts.nome ? `Olá, ${opts.nome}.` : "Olá."}</p>
     <p>Para criar uma nova senha, abra o link abaixo. Ele é válido por 24 horas.</p>
     <p><a href="${opts.link}" style="color:#C9953A;text-decoration:none;border-bottom:1px solid #C9953A;">Redefinir senha</a></p>
     <p>Se você não pediu, ignore este e-mail.</p>`,
  );
}

export function conviteUsuarioTemplate(opts: {
  link: string;
  empresa: string;
  papel: string;
}) {
  return layout(
    "Acesso ao ERP Anômalo",
    `<p>Você foi convidado a acessar o ERP Anômalo da ${opts.empresa}, como ${opts.papel}.</p>
     <p><a href="${opts.link}" style="color:#C9953A;text-decoration:none;border-bottom:1px solid #C9953A;">Criar acesso</a></p>
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
    `<p>O item <strong style="color:#fff;">${opts.item}</strong> chegou em ${opts.estoqueAtual} ${opts.unidade ?? "unidades"} (mínimo: ${opts.estoqueMinimo}).</p>
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
    `<p>${opts.descricao} no valor de <strong style="color:#fff;">${opts.valor}</strong> vence em ${opts.vencimento}.</p>`,
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
    `<p>O vendedor ${opts.vendedor} registrou a venda <strong style="color:#fff;">#${opts.numero}</strong> para ${opts.cliente} no valor de ${opts.valor}.</p>`,
  );
}
