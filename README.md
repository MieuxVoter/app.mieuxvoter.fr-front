# Front-end election web application using NextJs

[![aGPLV3](https://img.shields.io/badge/license-aGPLV3-lightgrey?style=for-the-badge)](./LICENSE.md)
[![Netlify Status](https://api.netlify.com/api/v1/badges/1e7d1d6b-af1a-44e6-a17f-19cdfd995951/deploy-status?style=for-the-badge)](https://app.netlify.com/projects/app-mieuxvoter/deploys)
[![Join the Discord chat at https://discord.gg/k9YRuZPSZs](https://img.shields.io/discord/705322981102190593.svg?style=for-the-badge)](https://discord.gg/k9YRuZPSZs)
![Stars](https://img.shields.io/github/stars/mieuxvoter/majority-judgment-web-app?style=for-the-badge)


:ballot_box: This project is going to be the default front-end for our [election application](https://app.mieuxvoter.fr).

:computer: It is connected to our [back-end](https://github.com/MieuxVoter/app.mieuxvoter.fr-back). The back-end is used for storing the votes and computing the majority judgment ranking. You can use our back-end free of charge, but you can also start your own instance of the back-end using our Dockerfiles.

:incoming_envelope: The front-end is responsable for sending the invitation mails. You can find the mail templates [on the functions folder](./functions/send-emails).

:world_map: The front-end stores its own translations. See below how you can edit them easily.


## :paintbrush: Customize your own application

The separation between the front-end and the back-end makes it easy to customize your own application. Just install 


## :gear: Install options

### **Option one:** One-click deploy

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/MieuxVoter/majority-judgment-web-app&utm_source=github)


### **Option two:** Manual clone

1. Clone this repo: `git clone https://github.com/MieuxVoter/app.mieuxvoter.fr-front.git`
2. Navigate to the directory and install dependencies: `npm install` or `make`
3. Start a local server: `npm run dev`  and open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
4. Make your changes
5. Deploy your project.

We recommend deploying the project to [Netlify](https://netlify.com), because we wrote the mail functions for the framework. Netlify parameters are written in `netlify.toml`.

If you decide to deploy your project in another way, please fill a pull request to guide future users!

## :incoming_envelope: Support for mail

To add support for mail sending, you need to connect the application with a mailing service. For now, we only support [Mailgun](mailgun.com), which offer very competitive prices. You can fill an issue if you require another mailing service.

To connect your application with Mailgun, you need to add the environment variables to your project:
  
- `MAILGUN_API_KEY`,
- `MAILGUN_DOMAIN`,
- `MAILGUN_URL`,
- `FROM_EMAIL_ADDRESS`,
- `REPLY_TO_EMAIL_ADDRESS`.

You can add the environment variables on an `.env` file or directly on [Netlify](https://docs.netlify.com/configure-builds/environment-variables/).


## :world_map: I18N at heart

[![Weblate Statistics about this project](https://hosted.weblate.org/widget/majority-judgment-web-app/287x66-black.png)](https://hosted.weblate.org/engage/majority-judgment-web-app)

Translating the application is done using the [glorious **Weblate**](https://hosted.weblate.org/engage/majority-judgment-web-app).

See [the wiki](https://github.com/MieuxVoter/majority-judgment-web-app/wiki/How-to-Translate-the-App) for more information.

> You can also directly modify the translation files in the folder `public/locales`.

In case you want to add support for another language, you need as well to add it on `net-i18next.config.js` and on the `LanguageSelector` component.

