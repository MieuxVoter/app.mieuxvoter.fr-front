import fs from 'fs';
import {Handler} from "@netlify/functions";
import formData from 'form-data';
import Mailgun from 'mailgun.js';
import Handlebars from 'handlebars';
import {i18n} from '../i18next';
import i18next from 'i18next';
import {MailgunMessageData, MessagesSendResult} from "mailgun.js/interfaces/Messages.js";


const {
  MAILGUN_API_KEY,
  MAILGUN_DOMAIN,
  MAILGUN_URL,
  FROM_EMAIL_ADDRESS,
  REPLY_TO_EMAIL_ADDRESS,
} = process.env;

const mailgun = new Mailgun(formData);
const mg = mailgun.client({
  username: 'api',
  key: MAILGUN_API_KEY,
  url: MAILGUN_URL,
});


i18next.init(i18n, (err) => {
  if (err) return console.log('something went wrong loading', err);
});


Handlebars.registerHelper('i18n',
  (str: string): string => {
    return (i18next != undefined ? i18next.t(str) : str);
  }
);


interface RequestPayload {
  recipients: {[email: string]: {[key: string]: string}};
  question: string;
  locale: string;
  action: "invite" | "admin";
}

const handler: Handler = async (event) => {
  /**
   * Send a mail using Mailgun
   */

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: 'Method Not Allowed',
      headers: {Allow: 'POST'},
    };
  }

  const {recipients, action, locale, question} = JSON.parse(event.body) as RequestPayload;

  if (!recipients) {
    return {
      statusCode: 422,
      body: 'The list of recipients is missing.',
    };
  }

  if (!question) {
    return {
      statusCode: 422,
      body: 'The question is missing.',
    };
  }

  if (!action || !["invite", "admin"].includes(action)) {
    return {
      statusCode: 422,
      body: 'Unknown action.',
    };
  }

  if (!locale || !["fr", "en"].includes(locale)) {
    return {
      statusCode: 422,
      body: 'Unknown locale.',
    };
  }

  const err = await i18next.changeLanguage(locale, (err) => {

    if (err) return {"error": err}
  });
  if (err && err["error"]) {
    return {statusCode: 200, ...err["error"]}
  }

  const templates = ["txt", "html"].map(ext =>
    fs.readFileSync(`${__dirname}/${action}.${ext}`).toString());
  const contents = templates.map(tpl => Handlebars.compile(tpl)({from_email_address: FROM_EMAIL_ADDRESS}));

  const payload: MailgunMessageData = {
    // from: `${i18next.t("Mieux Voter")} <mailgun@>`,
    from: FROM_EMAIL_ADDRESS || '"Mieux Voter" <postmaster@mg.app.mieuxvoter.fr>',
    to: Object.keys(recipients),
    subject: i18next.t(`email.${action}.subject`, {question}),
    txt: contents[0],
    html: contents[1],
    'h:Reply-To': REPLY_TO_EMAIL_ADDRESS || 'app@mieuxvoter.fr',
    'o:tag': action,
    'o:require-tls': true,
    'o:dkim': true,
    'recipient-variables': JSON.stringify(recipients),
  };

  try {
    const res: MessagesSendResult = await mg.messages.create(MAILGUN_DOMAIN, payload)

    if (res.status != 200) {
      return {
        statusCode: res.status,
        body: JSON.stringify(
          {
            "message": res.message,
            "details": res.details,
          }
        )
      }

    }
    return {
      statusCode: 200,
      body: JSON.stringify(
        {
          "message": res.message,
          "details": res.details,
          "status": "200",
          "results": `${Object.keys(recipients).length} emails were sent.`,
        }
      )
    }
  } catch (error) {
    return {
      statusCode: 422,
      body: JSON.stringify(
        {
          "status": "423",
          ...error
        }
      )
    }
  };

};

export {handler};
