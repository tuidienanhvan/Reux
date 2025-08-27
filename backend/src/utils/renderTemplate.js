import mjml2html from 'mjml';
import ejs from 'ejs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import colors from './colors.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const renderVerificationEmail = async (data) => {
  const mjmlTemplate = fs.readFileSync(
    path.join(__dirname, '../templates/verificationEmail.mjml'),
    'utf8'
  );

  const ejsRendered = ejs.render(mjmlTemplate, {
    ...data,
    colors,
  });

  const { html } = mjml2html(ejsRendered);
  return html;
};

export const renderUnlockEmail = async (data) => {
  const mjmlTemplate = fs.readFileSync(
    path.join(__dirname, '../templates/unlockEmail.mjml'),
    'utf8'
  );

  const ejsRendered = ejs.render(mjmlTemplate, {
    ...data,
    colors,
  });

  const { html } = mjml2html(ejsRendered);
  return html;
};

export const renderPasswordChangeEmail = async (data) => {
  const mjmlTemplate = fs.readFileSync(
    path.join(__dirname, '../templates/changePasswordEmail.mjml'),
    'utf8'
  );

  const ejsRendered = ejs.render(mjmlTemplate, {
    ...data,
    colors,
  });

  const { html } = mjml2html(ejsRendered);
  return html;
};

export const renderForgotPasswordEmail = async (data) => {
  const mjmlTemplate = fs.readFileSync(
    path.join(__dirname, '../templates/forgotPasswordEmail.mjml'),
    'utf8'
  );

  const ejsRendered = ejs.render(mjmlTemplate, {
    ...data,
    colors,
  });

  const { html } = mjml2html(ejsRendered);
  return html;
};