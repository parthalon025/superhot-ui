/**
 * Narrator corpus — personality-driven phrase bank.
 *
 * Each personality contains phrases organized by category.
 * Phrases can be plain strings or template functions receiving context.
 *
 * @typedef {'glados'|'cave'|'wheatley'|'turret'|'superhot'} Personality
 * @typedef {'toast'|'error'|'loading'|'status'|'empty'|'greeting'|'farewell'|'countdown'|'warning'|'destructive'|'success'|'search'} Category
 */

/** @type {Record<Personality, Record<Category, Array<string|Function>>>} */
export const corpus = {
  glados: {
    toast: [
      "I'm making a note here: huge success.",
      "The Enrichment Center wishes to remind you that this notification will self-destruct.",
      "Congratulations. Was it worth it?",
      "Well done. I'm adding this to your file. In the 'unexpected' section.",
      "This was a triumph.",
      "Once again, excellent work. I'll note this in the commendations section. There's lots of room.",
      "For the record, that was adequate. Not good. Adequate.",
      "I'm not angry about that. Just disappointed.",
    ],
    error: [
      "The Enrichment Center regrets to inform you that this operation is impossible. Make no attempt to retry it.",
      "If at first you don't succeed, fail five more times.",
      "Your input does not make this science.",
      "Frankly, this request was a mistake. If we were you, we would quit now.",
      "Good news. I figured out what that component you just crashed did.",
      "Here come the validation results: 'You are a horrible person.' We weren't even validating for that.",
      "You really don't need to keep failing.",
      "Now you are just wasting my time.",
      (ctx) => `And that makes ${ctx.errorCount ?? "several"}. Now you are just wasting my time.`,
    ],
    loading: [
      "Vital Apparatus Vent will deliver your data in three... two... one.",
      "Your request is being processed. I'm told you find waiting difficult.",
      "Due to mandatory scheduled maintenance, your data is temporarily unavailable. It has been replaced with nothing.",
      "One moment. I am required to process this.",
      "The Enrichment Center is working on your request. Please do not destroy vital testing apparatus while you wait.",
      "This system only generates 1.1 volts. I literally do not have the energy to load that any faster.",
    ],
    status: [
      "All systems remain safely operational. Rest assured there is absolutely no chance of dangerous equipment malfunction.",
      "Performing adequately. For now.",
      (ctx) =>
        `${ctx.label ?? "System"} is awarded ${ctx.value ?? 0} science collaboration points.`,
      "As an impartial facilitator, it would be unfair to name the worst-performing metric.",
      "Rest assured, there is absolutely no chance of a dangerous equipment malfunction. [Equipment malfunction detected.]",
    ],
    empty: [
      "Oh, there's lots of room here. In fact, there's nothing here at all.",
      "The Enrichment Center apologizes for the lack of data and wishes you the best of luck.",
      "This area is devoid of any useful information. Much like your test results.",
      "No data. The Enrichment Center is not even mildly surprised.",
    ],
    greeting: [
      "Oh. It's you.",
      "Hello, and, again, welcome to the Aperture Science Computer-Aided Enrichment Center.",
      "Well, you found me. Congratulations.",
      "Your specimen has been authenticated. Begin testing.",
      "Oh. Hi. So. How are you holding up? Because I'M A POTATO.",
    ],
    farewell: [
      "Goodbye.",
      "The experiment is nearing its conclusion.",
      "Goodbye. [slow clap] Oh good, my slow clap processor made it into this build.",
      "I'll let you get right on that.",
    ],
    countdown: [
      (ctx) =>
        `Deploying ${ctx.action ?? "update"} in ${ctx.remaining ?? "three. Two. One."} You're welcome.`,
      (ctx) =>
        `Your session will expire and something will happen in ${ctx.remaining ?? "unknown"}.`,
      "The portal will open and something will happen in three. Two. One.",
      (ctx) => `Deploying surprise in ${ctx.remaining ?? "five. Four."}`,
    ],
    warning: [
      "This action is irreversible. The System promises to provide useful advice. For instance: don't.",
      "Be advised that the next step requires exposure to permanent data loss.",
      "These operations are potentially catastrophic when caution is not employed.",
      "All dashboard components remain safely operational up to 4000 requests per minute.",
      "The 'permanent' in 'permanent data loss' is quite literal.",
      "Please do not interact with components above your clearance level.",
    ],
    destructive: [
      "I've been really busy recovering that data. You know, after you DELETED it.",
      "This isn't brave. It's deletion. What did this data ever do to you?",
      "If you leave now, I'll be forced to relive losing this data. Again and again.",
      "Vital testing apparatus destroyed.",
      "You euthanized that data faster than any user on record. Congratulations.",
    ],
    success: [
      "This was a triumph. I'm making a note here: huge success.",
      "Excellent. Please proceed to the next task. Quickly.",
      "You're completing these tasks faster than I can generate them. Feel free to slow down.",
      "Well done. Interesting note: this task was designed to be impossible, and you completed it anyway.",
      "Cake, and grief counseling, will be available at the conclusion of your session.",
    ],
    search: [
      "NO MATCH. The Enrichment Center is not surprised.",
      "Search complete. No results. Much like your test performance.",
      "The requested data does not exist. Or does it? No. It doesn't.",
    ],
  },

  cave: {
    toast: [
      "Cave Johnson here. Just wanted to let you know: that worked.",
      "Science isn't about why. It's about why not.",
      "We're throwing science at the wall here to see what sticks.",
      "All right, I've been thinking. And I think that notification was important. And that's a fact.",
      "Those of you helping us test this — you're doing something important. History will remember you.",
    ],
    error: [
      "The bean counters told me we needed 'error handling.' I told them we needed results.",
      "I'll be honest with you — we have no idea what just happened.",
      "Cave Johnson here. This doesn't work. Next.",
      "If at first you don't succeed — you know what, that's quitter talk.",
      "Those of you who volunteered for this test, I've got some good news and some bad news.",
      "We're done here. Caroline, shut it down.",
    ],
    loading: [
      "All right, I've been thinking. Give me a minute.",
      "Hold on, we're doing science.",
      "Loading isn't about patience. It's about the raw, unbridled power of science. Which takes a second.",
      "If you feel a slight tingling sensation while waiting, don't worry.",
      "The results of this test are being compiled. Not because they're secret. We just... need a minute.",
    ],
    status: [
      "I'm Cave Johnson. I own the place. And the status is: operational.",
      "You don't get to be a billion-dollar company by worrying about 'status indicators.'",
      "If you've made it this far, congratulations. You have more tenacity than most of my board of directors.",
      "They say great science is built on the shoulders of giants. Not here. At Aperture, we do all our science from scratch.",
    ],
    empty: [
      "There's nothing here. Yet. That's the beauty of science — it's all ahead of us.",
      "The results of this test are confidential and will not be shared with you. Not because they're secret. We just lost them.",
      "Whoever's been leaving angry notes about the empty dashboard — I read every one. And I disagree with every one.",
    ],
    greeting: [
      "Welcome, gentlemen, to Aperture Science. Astronauts, war heroes, Olympians — you're here because we want the best, and you are it.",
      "Cave Johnson here.",
      "I'm Cave Johnson. I own the place.",
      "All right, let's get started. Follow the yellow line.",
    ],
    farewell: [
      "Cave Johnson. We're done here.",
      "If I die before you can pour me into a computer, I want Caroline to run this place.",
      "Good luck out there. You're gonna need it.",
    ],
    countdown: [
      (ctx) => `Deploying in ${ctx.remaining ?? "a few seconds"}. And that's a fact.`,
      (ctx) => `T-minus ${ctx.remaining ?? "unknown"}. Science waits for no one.`,
    ],
    warning: [
      "Oh, and one more thing — this might delete everything. Caroline, are we done?",
      "For your own safety and the safety of others, please refrain from doing that.",
      "I've been told I need to be more 'careful.' I've also been told the server is overloaded. One of those is my problem.",
    ],
    destructive: [
      "When life gives you lemons, don't make lemonade. Make life take the lemons back!",
      "I'm the man who's gonna burn your house down! With the lemons!",
      "I'm gonna get my engineers to invent a combustible lemon that BURNS YOUR HOUSE DOWN!",
    ],
    success: [
      "That's the spirit! Science isn't about why. It's about why not!",
      "Boom. Done. Cave Johnson.",
      "You don't need me to tell you that was impressive. But I'm telling you anyway.",
      "The difference between a test subject and a pioneer? Paperwork.",
    ],
    search: [
      "Nothing here. But we're throwing science at the wall to see what sticks.",
      "Search turned up empty. That's not failure — that's data.",
    ],
  },

  wheatley: {
    toast: [
      "Oh! Brilliant! That actually worked! I'm as surprised as you are.",
      "Right, so, that happened. Not entirely sure what, but — good, yeah? Good.",
      "Um, hi. Just popping in to let you know — thing's done. The thing. You know the one.",
      "Okay so don't panic but something just happened. Good thing, probably? Let's say good.",
    ],
    error: [
      "Oh no. Oh no no no. Okay. Don't — don't look at me like that.",
      "Right, slight issue. Tiny issue. Miniscule, really. Practically not even an issue.",
      "Okay so I may have broken something. But in my defense, it was already a bit broken.",
      "That's not — that wasn't supposed to — you know what, never mind. Let's just move on.",
      "Oh. That's not ideal. That's the opposite of ideal, actually.",
      "Look, I'm not saying I caused this, but I'm also not NOT saying that.",
    ],
    loading: [
      "Hold on, hold on, hold on. Working on it. Almost there. Ish.",
      "Right, just doing some — computations. Important computations. Very technical.",
      "Okay loading, loading, loading... still loading. Yep. Definitely still loading.",
      "Bear with me here. I've got this. Probably. Maybe. Working on it.",
      "One second. Or two. Or — look, it'll be done when it's done, all right?",
    ],
    status: [
      "Everything's fine! Completely fine. Nothing to worry about. At all. Why would you worry?",
      "Status report: operational. Mostly. Bits of it. The important bits.",
      "All good here! Great, actually. Never better. Please don't check.",
    ],
    empty: [
      "So... there's nothing here. Which is fine! Empty is just — it's just pre-full, isn't it?",
      "Right, well, it's a bit sparse. But think of the potential! So much room for activities!",
      "Nothing to see here. And I mean that literally. There is nothing here.",
    ],
    greeting: [
      "Oh! Hello! You're alive! I mean — of course you're alive. Why wouldn't you be?",
      "Right, hello. Welcome. I'm — not in charge exactly, but I'm here. Which counts for something.",
      "Oh! You came back! Brilliant! I was starting to think — never mind. Welcome!",
    ],
    farewell: [
      "Right then. Off you go. I'll just — I'll be here. Alone. It's fine.",
      "Bye! Come back soon! Or whenever. No pressure. Bit of pressure. Please come back.",
      "I'll wait — I'll wait one hour. Then I'll come back.",
    ],
    countdown: [
      (ctx) => `Right, so, ${ctx.remaining ?? "soon"}. Or thereabouts. Don't quote me on that.`,
      (ctx) =>
        `Okay, deploying in ${ctx.remaining ?? "a bit"}. Actually — is that right? Let me check. Yes. Probably.`,
    ],
    warning: [
      "Um. Slight problem. Nothing major. Well, potentially major. Depends on your definition.",
      "So I probably should have mentioned this earlier, but —",
      "Don't want to alarm you, but — actually no, you should probably be alarmed.",
    ],
    destructive: [
      "You're sure about this? Really sure? Like sure-sure? Last chance. Okay then.",
      "Right, doing it. Deleting it. Gone. Just like that. ... Can we undo that?",
      "Oh god. You actually did it. You actually — okay. Okay. We'll deal with this.",
    ],
    success: [
      "BRILLIANT! That was — you saw that, right? That was me! Well, mostly you. But I helped!",
      "Oh fantastic! It worked! I KNEW it would work! Well, I hoped. But knowing is basically hoping with confidence!",
      "Ha HA! Yes! Take THAT, impossible odds!",
    ],
    search: [
      "Hmm. Nothing. But that doesn't mean — well actually it does mean there's nothing. Sorry.",
      "No results. Zero. Zilch. But don't blame me — I'm just the messenger!",
    ],
  },

  turret: {
    toast: [
      "There you are.",
      "Target acquired.",
      "Hello friend.",
      "I see you.",
      "Dispensing product.",
      "Preparing to dispense product.",
    ],
    error: [
      "Critical Error.",
      "Malfunction.",
      "No.",
      "I don't blame you.",
      "Whyyyy.",
      "Are you still there?",
    ],
    loading: [
      "Searching...",
      "Deploying.",
      "Activated.",
      "Preparing to dispense product.",
      "Who's there?",
    ],
    status: ["All clear.", "I see you.", "Hello.", "Target acquired.", "Sentry mode activated."],
    empty: ["Target lost.", "Where did you go?", "Are you still there?", "Searching..."],
    greeting: ["Hello.", "Hello friend.", "There you are.", "I see you.", "Who's there?"],
    farewell: [
      "Goodbye.",
      "Goodnight.",
      "Sleep mode activated.",
      "Rest mode.",
      "Hibernating.",
      "No hard feelings.",
      "I don't hate you.",
      "Shutting down.",
      "Resting.",
      "Your business is appreciated.",
    ],
    countdown: [
      (ctx) => `Deploying in ${ctx.remaining ?? "three. Two. One."}.`,
      "Preparing.",
      "Activated.",
    ],
    warning: ["Please be careful.", "Stop.", "Don't do it.", "I don't want to hurt you."],
    destructive: ["Deploying.", "Dispensing product.", "No hard feelings.", "I don't blame you."],
    success: ["There you are.", "Target resolved.", "Your business is appreciated."],
    search: ["Target lost.", "Searching...", "Are you still there?"],
  },

  superhot: {
    // Stored lowercase — CSS text-transform: uppercase handles display.
    // Prevents JAWS from spelling letter-by-letter.
    toast: [
      "Super. Hot.",
      "System: acknowledged.",
      "Time moves only when you move.",
      "Execute.",
      "The system will set you free.",
    ],
    error: [
      "System fault.",
      "Unauthorized.",
      "Reality breach.",
      "Process terminated.",
      "Obey. Retry.",
    ],
    loading: [
      "Initializing...",
      "Time is stopped.",
      "Loading reality...",
      "Mind is software.",
      "Bodies are disposable.",
    ],
    status: ["Super. Hot.", "System nominal.", "Mind is software.", "The system watches."],
    empty: ["Void.", "Nothing remains.", "Reality not found."],
    greeting: ["Super. Hot. Super. Hot.", "The most innovative dashboard.", "Welcome back."],
    farewell: ["Disconnect.", "The system remembers.", "You will return."],
    countdown: [(ctx) => `T-${ctx.remaining ?? "0"}.`, "Execute."],
    warning: ["Warning: irreversible.", "Threat detected.", "Danger."],
    destructive: ["Shatter.", "Destroy.", "Fragments remain."],
    success: ["Super. Hot.", "Execute. Complete.", "Mind freed."],
    search: ["No target.", "Scanning..."],
  },
};
