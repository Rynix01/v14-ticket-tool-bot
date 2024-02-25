const {
  Client,
  Collection,
  GatewayIntentBits,
  Partials,
} = require("discord.js");
const db = require("orio.db");
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildEmojisAndStickers,
    GatewayIntentBits.GuildIntegrations,
    GatewayIntentBits.GuildWebhooks,
    GatewayIntentBits.GuildInvites,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildMessageTyping,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.DirectMessageReactions,
    GatewayIntentBits.DirectMessageTyping,
    GatewayIntentBits.MessageContent,
  ],
  shards: "auto",
  partials: [
    Partials.Message,
    Partials.Channel,
    Partials.GuildMember,
    Partials.Reaction,
    Partials.GuildScheduledEvent,
    Partials.User,
    Partials.ThreadMember,
  ],
});
const config = require("./src/config.js");
const { readdirSync } = require("fs");
const moment = require("moment");
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v10");

let token = config.token;

client.commands = new Collection();

const rest = new REST({ version: "10" }).setToken(token);

const log = (l) => {
  console.log(`[${moment().format("DD-MM-YYYY HH:mm:ss")}] ${l}`);
};

//command-handler
const commands = [];
readdirSync("./src/commands").forEach(async (file) => {
  const command = require(`./src/commands/${file}`);
  commands.push(command.data.toJSON());
  client.commands.set(command.data.name, command);
});

client.on("ready", async () => {
  try {
    await rest.put(Routes.applicationCommands(client.user.id), {
      body: commands,
    });
  } catch (error) {
    console.error(error);
  }
  log(`${client.user.username} Aktif Edildi!`);
});

//event-handler
readdirSync("./src/events").forEach(async (file) => {
  const event = require(`./src/events/${file}`);
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args));
  } else {
    client.on(event.name, (...args) => event.execute(...args));
  }
});

//nodejs-events
process.on("unhandledRejection", (e) => {
  console.log(e);
});
process.on("uncaughtException", (e) => {
  console.log(e);
});
process.on("uncaughtExceptionMonitor", (e) => {
  console.log(e);
});
//

client.login(token);

const express = require("express");

const app = express();

const viewengine = require("ejs");

app.set("view engine", "ejs");

const path = require("path");

app.set("views", path.join(__dirname, "src/transcripts/ejs"));

callbackUrl = `http://localhost:80/callback`;

const passport = require("passport");
const Strategy = require("passport-discord").Strategy;
const session = require("express-session");
const MemoryStore = require("memorystore")(session);

// Deserializing and serializing users without any additional logic.
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

passport.use(
  new Strategy(
    {
      clientID: "761182128049225748",
      clientSecret: "Gr9nUtkZSrkZcIsaOoOAoN0UQbCseuBz",
      callbackURL: "http://localhost:80/callback",
      scope: ["identify", "guilds"],
    },
    (accessToken, refreshToken, profile, done) => {
      // On login we pass in profile with no logic.
      process.nextTick(() => done(null, profile));
    }
  )
);

// We initialize the memorystore middleware with our express app.
app.use(
  session({
    store: new MemoryStore({ checkPeriod: 86400000 }),
    secret:
      "#@%#&^$^$%@$^$&%#$%@#$%$^%&$%^#$%@#$%#E%#%@$FEErfgr3g#%GT%536c53cc6%5%tv%4y4hrgrggrgrgf4n",
    resave: false,
    saveUninitialized: false,
  })
);

// We initialize passport middleware.
app.use(passport.initialize());
app.use(passport.session());

// We declare a checkAuth function middleware to check if an user is logged in or not, and if not redirect him.
const checkAuth = (req, res, next) => {
  // If authenticated we forward the request further in the route.
  if (req.isAuthenticated()) return next();
  // If not authenticated, we set the url the user is redirected to into the memory.
  req.session.backURL = req.url;
  // We redirect user to login endpoint/route.
  res.redirect("/login");
};

// Login endpoint.
app.get(
  "/login",
  (req, res, next) => {
    if (req.headers.referer) {
      const parsed = url.parse(req.headers.referer);
      if (parsed.hostname === app.locals.domain) {
        req.session.lastVisitedPage = parsed.path;
      }
    } else {
      req.session.lastVisitedPage = "/";
    }
    next();
  },
  passport.authenticate("discord")
);
app.get(
  "/callback",
  passport.authenticate("discord", { failureRedirect: "/" }),
  (req, res) => {
    if (req.session.lastVisitedPage) {
      const lastVisitedPage = req.session.lastVisitedPage;
      res.redirect(lastVisitedPage);
    } else {
      res.redirect("/");
    }
  }
);
// Logout endpoint.
app.get("/logout", function (req, res) {
  // We destroy the session.
  req.session.destroy(() => {
    // We logout the user.
    req.logout();
    // We redirect user to index.
    res.redirect("/");
  });
});

app.get("/:userID/:ticketfullname", checkAuth, (req, res) => {
  let userID = req.params.userID;
  let ticketfullname = req.params.ticketfullname;
  const guild = client.guilds.cache.get(config.guildID);
  const member = guild.members.cache.get(req.user.id);
  if (
    userID !== req.user.id &&
    member.roles.cache.has(db.get(`ticket-setup_${guild.id}`).role) === false
  )
    return res.redirect("/");
  req.session.lastVisitedPage = `/${userID}/${ticketfullname}`;

  res.render(ticketfullname);
});

app.get("/", checkAuth, (req, res) => {
  const guild = client.guilds.cache.get(config.guildID);
  const member = guild.members.cache.get(req.user.id);

  const fs = require("fs");
  const klasorYolu = "./src/transcripts/ejs";

  const hedefKarakter = req.user.id;

  const tarihSaatRegex = /(\d{4}-\d{2}-\d{2})-(\d{2}_\d{2})/;

  fs.readdir(klasorYolu, (err, dosyaListesi) => {
    if (err) {
      console.error("Klasör okunamadı:", err);
      return;
    }

    const tarihler = [];
    const saatler = [];
    const allFiles = [];
    const userIDArray = [];
    const UserNameArray = [];

    if (member.roles.cache.has(db.get(`ticket-setup_${guild.id}`).role)) {
      dosyaListesi
        .filter((x) => !x.includes("index"))
        .forEach((dosyaAdi) => {
          const eslesme = dosyaAdi.match(tarihSaatRegex);
          const userID = dosyaAdi.substring(0, dosyaAdi.indexOf("-"));
          allFiles.push(dosyaAdi);
          if (eslesme) {
            const tarih = eslesme[1];
            const saat = eslesme[2].replace("_", ":");
            const userid = userID;
            const username =
              client.guilds.cache.get(config.guildID).members.cache.get(userid)
                .user.globalName || null;
            UserNameArray.push(username);
            userIDArray.push(userid);
            tarihler.push(tarih);
            saatler.push(saat);
          }
        });
      res.render("staff-index", {
        tarihler: tarihler,
        saatler: saatler,
        filtresiz: allFiles,
        userID: userIDArray,
        username: UserNameArray,
      });
    } else {
      dosyaListesi
        .filter((x) => x.includes(hedefKarakter))
        .forEach((dosyaAdi) => {
          const eslesme = dosyaAdi.match(tarihSaatRegex);
          allFiles.push(dosyaAdi);
          if (eslesme) {
            const tarih = eslesme[1];
            const saat = eslesme[2].replace("_", ":");
            tarihler.push(tarih);
            saatler.push(saat);
          }
        });

      res.render("index", {
        tarihler: tarihler,
        saatler: saatler,
        filtresiz: allFiles,
        userID: req.user.id,
      });
    }
  });
});

app.listen(80, () => {
  console.log("Ticket bot website listening on port 80!");
});
