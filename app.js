const Discord = require("discord.js");
const client = new Discord.Client();
const disbut = require("discord-buttons");
const { MessageButton, MessageActionRow } = disbut;

const { arr_diff, posponeTimeout } = require("./utilities.js");
const {
  getHelloLocalizedDescription,
  getHelloLocalizedAcceptation,
} = require("./greetings.js");

disbut(client);

const config = require("dotenv").config();

const Roles = {
  // customer + lang member role
  M_FR_R: "870014654410281040",
  M_EN_R: "870014786132381806",
  M_JP_R: "870015071571574814",
  M_ID_R: "874021909984071691",

  V_JP_R: "870826152409841754",
  V_FR_R: "870826225743040552",
  V_EN_R: "870826273591681065",
  V_ID_R: "874022257297616896",

  // member and validation roles
  PENDING_R: "869689612057063527",
  MEMBER_R: "837361986945679402",
  V_R: "869761858880569406",

  // customer roles :
  DENDELION_R: "836727159833231360",
  SAKURA_R: "836739797623111700",
  MARGUERITE_R: "836740675818881035",
  COMPUTE_R: "836741081777307708",
  GAME_R: "836741288890990612",
};

const activity = {
  pool1: [],
  pool2: [],
  pool3: {},
};

const pendings = {
  pool: {},
};

client.on("ready", () => {
  console.log("Bot is ready");
});

client.login(process.env.BOT_TOKEN);

client.on("message", (msg) => {
  if (msg.content === "Hello") {
    client.channels.cache.get("831370394006978580").send("");
    //msg.reply('Hi');
  }
});

const buildRoleIDList = (member, isIds = true) => {
  const roles = [];
  member.roles.cache.each(({ id, name }) => {
    if (isIds) {
      roles.push(id);
    } else {
      roles.push(name);
    }
  });
  return roles;
};

const getSignedMessageEmbeded = (newMember, icon) => {
  if (icon === null) {
    return new Discord.MessageEmbed().setAuthor(`${newMember.user.tag}`);
  } else {
    return new Discord.MessageEmbed().setAuthor(
      `${newMember.user.tag}`,
      `${icon}`
    );
  }
};

function getLanguageMember(oldMember, newMember) {
  // - - - - Getting member + lang list only - - - -
  // Old ones
  const oldSubSetOfMemberLang = oldMember.roles.cache.map(({ name, id }) => {
    return `${name}`;
  });

  const oldLangRoles = oldSubSetOfMemberLang.filter((name) => {
    return /^M-[a-z]{0,3}$/.test(name);
  });

  // New ones
  const newSubSetOfMemberLang = newMember.roles.cache.map(({ name, id }) => {
    return `${name}`;
  });

  const newLangRoles = newSubSetOfMemberLang.filter((name) => {
    return /^M-[a-z]{0,3}$/.test(name);
  });

  return { oldLangRoles, newLangRoles };
}

function removeValidRoles(newMember) {
  newMember.roles.remove(
    [
      Roles.M_FR_R,
      Roles.M_JP_R,
      Roles.M_EN_R,
      Roles.M_ID_R,
      Roles.V_JP_R,
      Roles.V_FR_R,
      Roles.V_EN_R,
      Roles.V_ID_R,
      Roles.V_R,
    ],
    "Is not a valid member anymore"
  );
}

const addRole = (id, button) => {
  const roles = /^.*-(\[(?:.+[,])*,?\])-to-\d+/.exec(button.id);
  let m = null;
  const re = /([^\[,]+),/g;
  while ((m = re.exec(roles[1]))) {
    if (m.index === re.lastIndex) re.lastIndex++;

    const roleID = Roles[m[1]];

    if (pendings.pool[id]) {
      pendings.pool[id].roles.add(roleID);
      delete pendings.pool[id];
    }
  }
};

const discardUser = (id) => {
  // already have the id
  if (pendings.pool[id]) {
    pendings.pool[id].roles.remove([Roles.MEMBER_R,Roles.PENDING_R]);
    delete pendings.pool[id];
  }
};

client.on("clickButton", async (button) => {
  const actionAndUserId = /^((?:-?[a-zA-Z\d])+).*-(\d+)/.exec(button.id);
  const action = actionAndUserId[1];
  const id = actionAndUserId[2];

  switch (action.toLowerCase()) {
    case "add-role":
      addRole(id, button);

      break;
    case "discard-user":
      discardUser(id);

      break;
    default:
      break;
  }

  // to mark the button action as completed
  button.reply.defer();
});
const getDiffRoles = (oldMember, newMember, useID = true) => {
  return arr_diff(
    oldMember.roles.cache.map(({ name, id }) => {
      return `${useID ? id : name}`;
    }),
    newMember.roles.cache.map(({ name, id }) => {
      return `${useID ? id : name}`;
    })
  );
};

const postponeReactionClosure = (oldMember) => {
  const itimer = activity.pool3[oldMember.id];
  posponeTimeout(itimer, config.parsed.POOL_TIME, {
    cb: () => {
      //console.log(`user id ${oldMember.id} removed from the pool`);
      delete activity.pool3[oldMember.id];
    },
    params: [],
  });
};

client.on("guildMemberUpdate", (oldMember, newMember) => {
  let diffRoles = getDiffRoles(oldMember, newMember, true);

  if (activity.pool3[oldMember.id] != null) {
    postponeReactionClosure(oldMember);
  } else {
    activity.pool3[oldMember.id] = {
      timer: setTimeout(() => {
        delete activity.pool3[oldMember.id];
      }, config.parsed.POOL_TIME),
    };

    let oldRoleIDs = buildRoleIDList(oldMember);
    let newRoleIDs = buildRoleIDList(newMember);

    let rolesArr = newMember.roles.cache.map(({ name, id }) => {
      return `${id}`;
    });

    const { oldLangRoles, newLangRoles } = getLanguageMember(
      oldMember,
      newMember
    );

    if (newLangRoles.length > 1) {
      const newestLangRole = arr_diff(oldLangRoles, newLangRoles);

      const newestId = newMember.roles.cache
        .filter(({ name }) => {
          return name == newestLangRole;
        })
        .map((r) => r.id);

      if (newestId) {
        newMember.roles.remove(newestId);
      }
    }

    // - - - - If a change within the member role list has occured - - - -
    // if we have removed a member with lang role
    if (newLangRoles.length == 0 && oldLangRoles.length > newLangRoles.length) {
      newMember.roles.remove(Roles.MEMBER_R, "Is not a member anymore");
      newMember.roles.remove(Roles.PENDING_R, "remove pending state");

      // remove all language roles

      removeValidRoles(newMember);
    }

    // if we have added a member with lang role
    else if (oldLangRoles.length < newLangRoles.length) {
      newMember.roles.add(Roles.MEMBER_R, "Is a member");
      rolesArr.push(Roles.MEMBER_R);
    }

    const isNotAMemberAnymore =
      newRoleIDs.length < oldRoleIDs.length &&
      !rolesArr.includes(Roles.MEMBER_R);

    const shouldLostPendingRole =
      rolesArr.includes(Roles.V_R) || isNotAMemberAnymore;

    if (shouldLostPendingRole) {
      // The member has lost it's Member role
      newMember.roles.remove(Roles.PENDING_R, "Has not the pending role");
      if (isNotAMemberAnymore) {
        newMember.roles.remove(
          [
            Roles.DENDELION_R,
            Roles.SAKURA_R,
            Roles.MARGUERITE_R,
            Roles.COMPUTE_R,
            Roles.GAME_R,
          ],
          "is not a member anymore"
        );

        removeValidRoles(newMember);
      }
    }

    //check if the newRoleIDs had one more role, which means it added a new role
    else if (newRoleIDs.length > oldRoleIDs.length) {
      // refresh the roles array
      let newrolesArr = newMember.roles.cache.map(({ name, id }) => {
        return `${name}`;
      });

      // The member has gain it's Member role
      if (
        rolesArr.includes(Roles.MEMBER_R) &&
        !rolesArr.includes(Roles.V_R) &&
        newLangRoles.length < 2
      ) {
        const translatedMessage = getHelloLocalizedDescription(newLangRoles[0]);

        if ("NOT TRANSLATABLE" != translatedMessage) {
          newMember.roles.add(Roles.PENDING_R, "Has the pending role");

          const user = client.users.cache.get(newMember.user.id);

          const embedMessage = new Discord.MessageEmbed().setDescription(
            translatedMessage
          );

          user.send(embedMessage);

          let IDNum = Roles.PENDING_R;
          //fetch the link of the icon name
          //NOTE: only works if the user has their own icon, else it'll return null if user has standard discord icon
          let icon = newMember.user.avatarURL();

          let txtChannel = client.channels.cache.get("869725645834444880"); //my own text channel, you may want to specify your own

          const newRoleAdded = getSignedMessageEmbeded(newMember, icon)
            .setTitle("New adhesion request !")
            .setDescription(
              `<@${newMember.user.id}> wants to join the fun\nStatus :<@&${IDNum}>`
            )
            .setTimestamp();

          let acceptBut = new MessageButton()
            .setStyle("green")
            .setLabel("Accept")
            .setID(`add-role-[V_R,]-to-${newMember.user.id}`);

          let discardBut = new MessageButton()
            .setStyle("red")
            .setLabel("Discard")
            .setID(`discard-User-${newMember.user.id}`);

          txtChannel.send(newRoleAdded, {
            buttons: [acceptBut, discardBut],
          });

          // memorize the oldMember so we can modify the roles later...
          pendings.pool[oldMember.id] = oldMember;
        }
      }
    }

    if (diffRoles[0] === Roles.V_R && newRoleIDs.length > oldRoleIDs.length) {
      // we add the validation lang
      const lang = /^M-([a-z]{0,3})$/.exec(newLangRoles[0]);
      if (lang) {
        const validatedLanguage =
          lang[1] == "fr"
            ? Roles.V_FR_R
            : lang[1] == "jp"
            ? Roles.V_JP_R
            : lang[1] == "id"
            ? Roles.V_ID_R
            : Roles.V_EN_R;
        newMember.roles.add(validatedLanguage, "language validation defined");

        // MESSAGING THE USER
        const translatedMessage = getHelloLocalizedAcceptation(newLangRoles[0]);

        const user = client.users.cache.get(newMember.user.id);

        const embedMessage = new Discord.MessageEmbed().setDescription(
          translatedMessage
        );

        user.send(embedMessage);
      }
    }
  }
});
