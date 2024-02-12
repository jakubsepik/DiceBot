const { Client, GatewayIntentBits, Partials, EmbedBuilder  } = require("discord.js");
const client = new Client({
  intents: [
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.Channel],
});
require("dotenv").config();
const TOKEN = process.env.TOKEN;
const util = require("util");
var Guild, Test_channel;
var verbose = false;

client.on("ready", () => {
  console.log("Ready");
});

client.on("messageCreate", function (msg) {
  if (msg.channel.name !== "rolls") return;
  if (msg.author.bot) return;
  if (msg.content === "verbose") verbose = !verbose;
  Test_channel = msg.channel;
  let wrong = false;

  let rollsArray = [];
  const split = msg.content.replace(/[ +]+/, "+").split(/[+ ]/);
  console.log(split);
  split.forEach((element) => {
    element = element.trim();
    if (/^\d*[d*]\d+[as]?$/.test(element)) {
      console.log("hod");
      takeRoll(element);
    } else if (/^\d+$/.test(element)) {
      console.log("plus");
      addValue(element);
    } else if (/^g$/.test(element)) {
      console.log("guidance");
      getRandom(1, 4, "g");
    } else wrong = true;
  });
  if (wrong) return;
  if (verbose)
    msg.channel.send(
      util.inspect(rollsArray, { showHidden: false, depth: null })
    );
  let sum = 0;
  let string = "";
  let arrays = "";

  rollsArray.forEach((element) => {
    sum = sum + parseInt(element.sum[0]);
    if (/[as]/.test(element.flag))
      string = string + " + " + element.sum[0] + `~~(${element.sum[1]})~~`;
    else string = string + " + " + element.sum[0];
    if (element.isDice)
      arrays = arrays + " + " + JSON.stringify(element.rolls[0]);
    else arrays = arrays + " + *" + element.sum[0] + "*";
  });

  const exampleEmbed = new EmbedBuilder()
    .setColor("#FF0000")
    .setTitle("Roll status")
    .setDescription("-----------------")
    .addFields(
      { name: "Values:", value: string.slice(3) },
      { name: "Rolls:", value: arrays.slice(3) },
      { name: "Sum:", value: `**${sum}**` }
    )
    .setFooter({text:"You are epic (by sepik)"});
  Test_channel.send({ embeds: [exampleEmbed] });

  function takeRoll(element) {
    const split = element.split(/[*d]/);
    let times = /[d*]/.test(element.charAt(0)) ? 1 : split[0];
    if (/[as]/.test(element.charAt(element.length - 1)))
      getRandom(
        times,
        split[1].substring(0, split[1].length - 1),
        element.charAt(element.length - 1)
      );
    else getRandom(times, split[1], null);
  }

  function getRandom(times, max, flag) {
    let object = {
      isDice: true,
      times: times,
      dice: max,
      flag: flag,
      sum: [],
      rolls: [],
    };
    let advantage = flag != null ? 2 : 1;

    for (let o = 0; o < advantage; o++) {
      let hodyArray = [];
      let sum = 0;
      for (let i = 0; i < times; i++) {
        let random = Math.floor(Math.random() * max) + 1;
        sum = sum + random;
        hodyArray.push(random);
      }

      object.sum.push(sum);
      object.rolls.push(hodyArray);

      if (
        (object.sum[0] <= object.sum[1] && flag === "a") ||
        (object.sum[0] >= object.sum[1] && flag === "s")
      ) {
        let tmp = object.sum[0];
        object.sum[0] = object.sum[1];
        object.sum[1] = tmp;

        tmp = object.rolls[0];
        object.rolls[0] = object.rolls[1];
        object.rolls[1] = tmp;
      }
    }
    rollsArray.push(object);
  }

  function addValue(element) {
    rollsArray.push({
      isDice: false,
      sum: element,
      flag: null,
    });
  }
});

client.login(TOKEN);
