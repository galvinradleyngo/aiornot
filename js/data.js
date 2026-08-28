// Static card data for "To AI or Not to AI?" — verbatim from the physical game.
// This never changes at runtime; there is no live content editor by design.

export const EDITIONS = {
  leadership: {
    label: "Leadership",
    use_cases: [
      { n: 1, cat: "Admissions", title: "Essay Screening", body: "An AI tool flags applicants whose essays seem “AI-generated” and ranks essays by which ones deserve priority review by admissions staff." },
      { n: 2, cat: "Communications", title: "Crisis Statement", body: "A serious incident just happened on campus. Your communications team wants AI to draft the first public statement within the hour." },
      { n: 3, cat: "Academic Affairs", title: "Tenure Dossier Review", body: "AI is used to summarize faculty tenure case files and draft a recommendation memo for the promotions committee." },
      { n: 4, cat: "Student Life", title: "Dropout Risk Prediction", body: "An AI model scans grades, attendance, and LMS activity to flag students likely to withdraw, so advisors can intervene early." },
      { n: 5, cat: "Admissions", title: "Prospective Student Chatbot", body: "An AI chatbot answers questions from prospective students and parents on the admissions website, 24 hours a day." },
      { n: 6, cat: "Research", title: "Grant Proposal Drafting", body: "The research office uses AI to draft major sections of a large external grant proposal ahead of a tight funder deadline." },
      { n: 7, cat: "Governance", title: "Board Briefing Notes", body: "AI transcribes board meetings and drafts summary briefing notes and action items for trustees." },
      { n: 8, cat: "Advancement", title: "Personalized Donor Appeals", body: "AI analyzes giving history to draft individually personalized fundraising appeal letters for a capital campaign." },
      { n: 9, cat: "Academic Affairs", title: "Curriculum Redesign", body: "The academic council uses AI to help redesign the general education curriculum to meet new accreditation standards." },
      { n: 10, cat: "Student Life", title: "Academic Integrity Detection", body: "AI flags student papers suspected of being AI-generated or plagiarized — flags that can trigger disciplinary action." },
      { n: 11, cat: "Human Resources", title: "Faculty Hiring Screening", body: "AI screens hundreds of faculty applications and ranks candidates before the search committee ever sees them." },
      { n: 12, cat: "Communications", title: "Commencement Speech", body: "The president asks AI to draft the commencement address and other major public speeches." },
      { n: 13, cat: "Finance", title: "Budget Forecasting", body: "The finance office uses AI to model multi-year budget scenarios and recommend where to cut or invest." },
      { n: 14, cat: "Student Life", title: "Mental Health Triage Bot", body: "An AI chatbot is offered as the first point of contact for students in distress, before they are referred to a human counselor." },
      { n: 15, cat: "Governance", title: "Contract & Policy Review", body: "General counsel uses AI to review vendor contracts and flag risky clauses before signing." },
      { n: 16, cat: "International Admissions", title: "International Recruitment & Admissions", body: "AI screens and ranks prospective international applicants — factoring in academic records, essays, and English proficiency scores — to prioritize outreach and offers." },
      { n: 17, cat: "International Admissions", title: "Visa & Compliance Document Review", body: "AI reviews international students' visa and immigration paperwork for errors before it's submitted to government agencies, flagging anything that could delay or jeopardize their status." },
      { n: 18, cat: "Governance", title: "Accreditation Self-Study", body: "Facing a tight deadline, the accreditation team asks AI to draft large portions of the official self-study report." }
    ],
    risks: [
      { n: 1, title: "Bias & Discrimination", body: "Training data reflects historical inequities, disadvantaging people by race, gender, income, or disability." },
      { n: 2, title: "Hallucination", body: "The AI confidently generates false or fabricated information and presents it as fact." },
      { n: 3, title: "Sycophancy", body: "The AI tells you what you want to hear rather than what's accurate, reinforcing existing biases or bad decisions." },
      { n: 4, title: "Privacy & Data Exposure", body: "Sensitive data — student records, donor info, health data — may be leaked, misused, or exposed to third parties." },
      { n: 5, title: "Accountability Gap", body: "When AI contributes to a decision, it becomes unclear who is responsible if it goes wrong." },
      { n: 6, title: "The Black Box", body: "The AI's reasoning isn't explainable, making it hard to justify decisions to the people affected by them." },
      { n: 7, title: "Over-Reliance & De-skilling", body: "Heavy reliance on AI erodes staff and faculty judgment, expertise, and critical thinking over time." },
      { n: 8, title: "Loss of Human Trust", body: "Students, donors, or faculty feel disrespected or unheard when AI replaces genuine personal engagement." },
      { n: 9, title: "Security Vulnerability", body: "AI systems can be hacked, manipulated, or “jailbroken” to produce harmful or unauthorized outputs." },
      { n: 10, title: "Homogenization", body: "Widespread AI use can flatten diversity of thought, voice, and ideas across the institution." },
      { n: 11, title: "Legal & Regulatory Liability", body: "AI use may violate data protection laws, labor laws, or institutional policy — exposing the institution to risk." },
      { n: 12, title: "Reputational Damage", body: "A visible AI failure — a biased decision, an embarrassing error, a leak — can damage public trust fast." },
      { n: 13, title: "Cognitive Surrender", body: "People stop thinking it through and just defer to the AI's answer — judgment quietly atrophies as outputs go unquestioned, even on calls that deserve real scrutiny." },
      { n: 14, title: "Environmental Impact", body: "Training and running AI models consumes significant energy and water, and adds real strain to data centers — a cost that can sit uneasily next to an institution's own sustainability commitments." }
    ],
    potentials: [
      { n: 1, title: "Time & Efficiency", body: "AI completes routine or high-volume tasks far faster than manual work, freeing up staff time." },
      { n: 2, title: "Scale & Reach", body: "AI can serve far more people at once than human staff alone — e.g. answering thousands of inquiries." },
      { n: 3, title: "24/7 Availability", body: "AI can provide support or information outside normal working hours, any day of the week." },
      { n: 4, title: "Personalization", body: "AI can tailor communication or recommendations to each individual's needs and history." },
      { n: 5, title: "Consistency", body: "AI applies the same criteria and process every time, reducing case-by-case variability." },
      { n: 6, title: "Early Pattern Detection", body: "AI can surface patterns in large datasets that humans would otherwise miss or catch too late." },
      { n: 7, title: "Augmented Decision-Making", body: "AI gives humans more or better information to make a final judgment call — without replacing them." },
      { n: 8, title: "Cost Reduction", body: "Automating routine tasks can meaningfully reduce operating costs over time." },
      { n: 9, title: "Accessibility", body: "Tools like translation, transcription, and text-to-speech can make information reachable to more people." },
      { n: 10, title: "Frees Staff for Higher-Value Work", body: "Removing repetitive tasks lets skilled staff focus on judgment, relationships, and strategy." },
      { n: 11, title: "Faster Iteration", body: "AI can quickly generate drafts or options, speeding up creative and planning processes." },
      { n: 12, title: "Data-Driven Insight", body: "AI can synthesize large, complex bodies of information into something usable and clear." }
    ]
  },
  teacher: {
    label: "Teacher",
    use_cases: [
      { n: 1, cat: "Assessment", title: "AI-Assisted Essay Grading", body: "An AI tool reads student essays and suggests a grade and written feedback, which the teacher can accept, edit, or override." },
      { n: 2, cat: "Planning", title: "Lesson Plan Generation", body: "A teacher asks AI to draft a full week of lesson plans aligned to the curriculum, to save prep time on a busy week." },
      { n: 3, cat: "Instruction", title: "AI Tutoring Chatbot", body: "Students are given access to an AI chatbot that answers subject questions and walks them through problems outside class hours." },
      { n: 4, cat: "Academic Integrity", title: "AI-Content Detection", body: "A teacher runs student submissions through an AI-detection tool, and a high score triggers an academic dishonesty conversation." },
      { n: 5, cat: "Assessment", title: "Automated Writing Feedback", body: "AI gives students instant feedback on drafts — grammar, structure, clarity — before they submit the final version to the teacher." },
      { n: 6, cat: "Assessment", title: "AI-Generated Quiz Questions", body: "A teacher asks AI to generate a bank of quiz and test questions covering the last two units, to save time writing assessments." },
      { n: 7, cat: "Inclusion", title: "Differentiated Materials", body: "AI adapts a single lesson's reading level and format to fit students with different needs, including IEPs and English learners." },
      { n: 8, cat: "Communication", title: "Parent Email Drafting", body: "A teacher uses AI to draft a sensitive email to a parent about their child's grades or behavior, then reviews it before sending." },
      { n: 9, cat: "Classroom Management", title: "Behavior & Engagement Monitoring", body: "Classroom cameras feed an AI system that flags students who appear disengaged or disruptive, alerting the teacher in real time." },
      { n: 10, cat: "Inclusion", title: "Real-Time Translation", body: "AI translates handouts and live instruction for English-language-learner students, so they can follow along in their first language." },
      { n: 11, cat: "Advising", title: "AI-Drafted Recommendation Letters", body: "A teacher asks AI to draft a college recommendation letter for a student based on notes, grades, and a few bullet points." },
      { n: 12, cat: "Assessment", title: "AI Exam Proctoring", body: "During remote or take-home exams, an AI system watches students through their webcam and flags anything that looks like cheating." },
      { n: 13, cat: "Classroom Management", title: "Automated Attendance & Participation", body: "AI tracks who is present and how often each student speaks in class, feeding a participation score straight into the gradebook." },
      { n: 14, cat: "Planning", title: "Curriculum Standards Alignment", body: "A department uses AI to check whether its course materials actually cover every required state or accreditation standard." },
      { n: 15, cat: "Instruction", title: "After-Hours Homework Help Bot", body: "Students can message an AI chatbot at 10pm the night before an assignment is due, instead of waiting to ask the teacher the next day." },
      { n: 16, cat: "Advising", title: "At-Risk Student Flagging", body: "AI scans grades, attendance, and login activity to flag students likely to fail or drop out, so a counselor can step in early." },
      { n: 17, cat: "Assessment", title: "AI-Built Grading Rubrics", body: "A teacher asks AI to design a detailed grading rubric for a new project, rather than writing one from scratch." },
      { n: 18, cat: "Professional Development", title: "AI-Generated Training Materials", body: "The school asks AI to draft the slide deck and handouts for an upcoming teacher professional-development session on a new policy." }
    ],
    risks: [
      { n: 1, title: "Bias & Discrimination", body: "AI grading and detection tools can score some students unfairly — penalizing unfamiliar dialects, accents in speech-to-text, or writing styles the model wasn't trained on." },
      { n: 2, title: "Hallucination", body: "AI confidently generates facts, sources, or answer keys that are simply wrong — risky if it's used to grade or to generate 'correct' answers." },
      { n: 3, title: "Sycophancy", body: "AI tends to tell a teacher what they want to hear — that a struggling student is 'improving' or a lesson plan is 'strong' — rather than flag a real problem." },
      { n: 4, title: "Privacy & Data Exposure", body: "Grades, IEPs, disciplinary notes, or family details typed into an AI tool may be stored, reused to train the model, or exposed to others." },
      { n: 5, title: "Accountability Gap", body: "When an AI-assisted grade or flag turns out to be wrong, it's unclear whether the teacher, the school, or the AI vendor is responsible for fixing it." },
      { n: 6, title: "The Black Box", body: "Teachers often can't see why an AI tool gave a particular grade or flagged a student as 'at risk' — hard to explain to a student or a parent." },
      { n: 7, title: "Over-Reliance & De-skilling", body: "Leaning on AI for grading, planning, or feedback can quietly erode a teacher's own instinct for reading student work and adjusting on the fly." },
      { n: 8, title: "Loss of Human Trust", body: "Students and parents can feel dismissed if they sense a teacher's feedback, email, or recommendation letter was mostly AI-written." },
      { n: 9, title: "Security Vulnerability", body: "Classroom AI tools and chatbots can be hacked or tricked (\"jailbroken\") into producing inappropriate or harmful content for students." },
      { n: 10, title: "Homogenization", body: "If every student's essay gets nudged toward the same AI-favored structure and voice, classroom writing can start to sound the same." },
      { n: 11, title: "Legal & Regulatory Liability", body: "Using AI on minors' data, or for high-stakes calls like grades or discipline, can run into student privacy laws and school policy." },
      { n: 12, title: "Reputational Damage", body: "One viral case of an unfair AI grade or a wrongly flagged cheating accusation can damage trust in a teacher or a school fast." },
      { n: 13, title: "Cognitive Surrender", body: "Teachers stop double-checking AI-generated grades, feedback, or content and just accept it — even on calls that deserve a closer look." },
      { n: 14, title: "Environmental Impact", body: "The AI tools teachers use every day run on data centers that consume real energy and water — a cost worth weighing against the time saved." }
    ],
    potentials: [
      { n: 1, title: "Time & Efficiency", body: "AI can turn hours of grading or lesson-planning into minutes, freeing up time for actual teaching and one-on-one support." },
      { n: 2, title: "Scale & Reach", body: "One teacher's after-hours chatbot can answer dozens of students' questions at once — something no single teacher could do alone." },
      { n: 3, title: "24/7 Availability", body: "Students can get homework help or a concept explained at 11pm, not just during school hours." },
      { n: 4, title: "Personalization", body: "AI can adjust reading level, pacing, or examples for each student's needs — including IEPs and English learners — far faster than doing it by hand." },
      { n: 5, title: "Consistency", body: "AI applies the same rubric the same way to every student's work, reducing the day-to-day mood or fatigue effects that creep into manual grading." },
      { n: 6, title: "Early Pattern Detection", body: "AI can spot a student quietly slipping — falling attendance, dropping grades — before it becomes a crisis, giving teachers time to step in." },
      { n: 7, title: "Augmented Decision-Making", body: "AI can suggest a grade or flag a concern, but the teacher still makes the final call — using judgment of the whole student, not just the data." },
      { n: 8, title: "Cost Reduction", body: "Automating routine tasks like scheduling or first-pass grading can free up school budget for things that need a human — smaller classes, more support staff." },
      { n: 9, title: "Accessibility", body: "Live translation and text-to-speech tools can make a lesson usable for English learners and students with disabilities in real time." },
      { n: 10, title: "Frees Staff for Higher-Value Work", body: "Cutting time spent on routine grading and admin work lets teachers spend more time actually teaching, mentoring, and connecting with students." },
      { n: 11, title: "Faster Iteration", body: "AI can quickly generate multiple versions of a lesson or quiz, so teachers can try something and adjust it instead of starting from scratch." },
      { n: 12, title: "Data-Driven Insight", body: "AI can turn a semester's worth of scattered grades and notes into a clear picture of where a student — or a whole class — is struggling." }
    ]
  },
  student: {
    label: "Student",
    use_cases: [
      { n: 1, cat: "Writing", title: "Brainstorming Essay Ideas", body: "A student asks AI to suggest possible thesis statements and angles before starting to write a paper." },
      { n: 2, cat: "Coding", title: "Debugging Code with AI", body: "A student pastes broken code from a programming assignment into AI and asks it to find and fix the error." },
      { n: 3, cat: "Study Skills", title: "Summarizing a Long Reading", body: "Facing 60 pages of assigned reading the night before class, a student asks AI to summarize the key points instead of reading it all." },
      { n: 4, cat: "Study Skills", title: "24/7 Study Buddy for Exams", body: "A student uses an AI chatbot to quiz them and explain concepts at 1am, when no classmate or tutor is available." },
      { n: 5, cat: "Language", title: "Translating a Foreign-Language Text", body: "A student uses AI to translate an assigned reading in a language class instead of working through it themselves." },
      { n: 6, cat: "Writing", title: "AI Grammar & Style Check", body: "Before submitting an essay, a student runs it through AI to catch grammar mistakes and improve awkward sentences." },
      { n: 7, cat: "Study Skills", title: "AI-Generated Flashcards", body: "A student uploads their lecture notes and asks AI to turn them into a set of flashcards for exam review." },
      { n: 8, cat: "Collaboration", title: "AI-Managed Group Project", body: "A student uses AI to split up tasks and build a timeline for a group project, then shares the plan with teammates." },
      { n: 9, cat: "Study Skills", title: "Step-by-Step Concept Explainer", body: "A student asks AI to explain a difficult math or science concept a different way after not understanding it in class." },
      { n: 10, cat: "Writing", title: "AI-Written First Draft", body: "Short on time, a student asks AI to write a full first draft of an essay, which they plan to edit before turning it in." },
      { n: 11, cat: "Career Prep", title: "AI Mock Interview Practice", body: "A student practices answering interview questions with an AI tool ahead of a real internship or job interview." },
      { n: 12, cat: "Research", title: "Fact-Checking a Claim", body: "Before including a statistic in a research paper, a student asks AI to verify whether the claim is accurate and where it comes from." },
      { n: 13, cat: "Study Skills", title: "AI-Generated Practice Problems", body: "A student asks AI to generate extra practice problems similar to ones from a hard homework set, to build more confidence before a test." },
      { n: 14, cat: "Academic Integrity", title: "Using AI During a Timed Test", body: "During a proctored, closed-resource exam, a student secretly opens an AI chatbot on their phone to help answer questions." },
      { n: 15, cat: "Advising", title: "AI Course & Elective Recommendations", body: "A student asks AI which electives to take next semester based on their transcript, interests, and career goals." },
      { n: 16, cat: "Career Prep", title: "AI-Written Resume & Cover Letter", body: "A student asks AI to write a resume and cover letter for a summer internship application from a short list of experiences." },
      { n: 17, cat: "Collaboration", title: "AI-Generated Presentation Slides", body: "A student asks AI to design and write the slides for a class presentation, including the speaker notes." },
      { n: 18, cat: "Wellbeing", title: "Turning to AI for Emotional Support", body: "Stressed about grades and feeling like they have no one to talk to, a student starts confiding in an AI chatbot late at night." }
    ],
    risks: [
      { n: 1, title: "Bias & Discrimination", body: "AI writing and grading tools can be less accurate for students who write in a different dialect, are non-native English speakers, or come from a background underrepresented in the AI's training data." },
      { n: 2, title: "Hallucination", body: "AI confidently gives you facts, citations, or explanations that are just wrong — risky if you're using it to research a paper or study for an exam." },
      { n: 3, title: "Sycophancy", body: "AI tends to tell you your essay or argument is stronger than it actually is, instead of giving the honest critique that would actually improve it." },
      { n: 4, title: "Privacy & Data Exposure", body: "Personal details you type into a chatbot — about your grades, your family, or even your mental health — may be stored or used in ways you don't expect." },
      { n: 5, title: "Accountability Gap", body: "If AI gives you wrong information and you use it in an assignment, it's not always clear who's responsible when it goes wrong — you, or the tool." },
      { n: 6, title: "The Black Box", body: "AI can't always explain why it gave you a particular answer, which makes it hard to know if you can actually trust — or learn from — what it told you." },
      { n: 7, title: "Over-Reliance & De-skilling", body: "Leaning on AI to write your essays or solve your problem sets can mean you never actually build the skill you were supposed to be practicing." },
      { n: 8, title: "Loss of Human Trust", body: "A teacher, teammate, or interviewer who suspects your work is mostly AI-written may stop trusting your work altogether — even the parts you wrote yourself." },
      { n: 9, title: "Security Vulnerability", body: "AI chatbots can be tricked into giving harmful, inappropriate, or unsafe advice if someone knows how to manipulate them." },
      { n: 10, title: "Homogenization", body: "If everyone uses AI to polish their essays the same way, papers across a whole class can start to sound alike — and your own voice can get lost." },
      { n: 11, title: "Legal & Regulatory Liability", body: "Submitting AI-generated work as entirely your own can violate your school's academic integrity policy, even if you didn't mean to break a rule." },
      { n: 12, title: "Reputational Damage", body: "Getting caught passing off AI work as your own can follow you — affecting a grade, a recommendation, or how a teacher sees you going forward." },
      { n: 13, title: "Cognitive Surrender", body: "It's easy to stop thinking something through yourself and just take whatever AI says as the answer — even when it's worth double-checking." },
      { n: 14, title: "Environmental Impact", body: "Every AI chat you send runs on a data center that uses real energy and water — a small cost that adds up across millions of students doing the same thing." }
    ],
    potentials: [
      { n: 1, title: "Time & Efficiency", body: "AI can get you through repetitive tasks — formatting citations, catching a typo — faster, leaving more time for the parts that actually require thinking." },
      { n: 2, title: "Scale & Reach", body: "A single AI study tool can help you review material in ways that would otherwise require hiring a tutor or finding a study group at the right time." },
      { n: 3, title: "24/7 Availability", body: "AI can explain a concept or quiz you at 1am before an exam, when no professor, TA, or classmate is around." },
      { n: 4, title: "Personalization", body: "AI can explain the same concept several different ways until one actually clicks — something a single textbook explanation can't do." },
      { n: 5, title: "Consistency", body: "AI gives the same quality of explanation every time you ask, without having a bad day or losing patience the way a person might." },
      { n: 6, title: "Early Pattern Detection", body: "AI can help you notice patterns in your own quiz mistakes or study habits that you might not catch on your own." },
      { n: 7, title: "Augmented Decision-Making", body: "AI can help you think through options — like which courses to take — by laying out information, while you make the actual decision based on what matters to you." },
      { n: 8, title: "Cost Reduction", body: "Free or low-cost AI tools can substitute for expensive tutoring or paid study resources for some tasks." },
      { n: 9, title: "Accessibility", body: "Text-to-speech, translation, and simplification tools can make dense readings or lectures usable for students with disabilities or language barriers." },
      { n: 10, title: "Frees You Up for Higher-Value Work", body: "Letting AI handle rote formatting or basic research frees up your time and energy for the actual thinking, writing, and problem-solving that build your skills." },
      { n: 11, title: "Faster Iteration", body: "AI can help you generate a rough first draft or extra practice problems quickly, so you spend your time revising and improving instead of staring at a blank page." },
      { n: 12, title: "Data-Driven Insight", body: "AI can help you make sense of a big pile of lecture notes or readings, turning them into something organized you can actually study from." }
    ]
  }
};

export const DECISIONS = [
  { n: 1, key: "toai", title: "TO AI", body: "Use AI for this, largely as-is.", cls: "yes" },
  { n: 2, key: "notoai", title: "NOT TO AI", body: "Keep this fully human. Do not use AI here.", cls: "no" },
  { n: 3, key: "guardrails", title: "TO AI — WITH GUARDRAILS", body: "Use AI, but only with specific safeguards in place (e.g. human review, disclosure, audit, opt-out).", cls: "guard" }
];

export function getDeck(edition) {
  return EDITIONS[edition];
}

// Build the 26-card hand deck (14 risk + 12 opportunity) as flat refs: {type:'risk'|'opp', n}
export function fullCardDeck(edition) {
  const ed = EDITIONS[edition];
  const cards = [];
  for (const r of ed.risks) cards.push({ type: "risk", n: r.n });
  for (const o of ed.potentials) cards.push({ type: "opp", n: o.n });
  return cards;
}

export function cardKey(card) {
  return `${card.type}_${card.n}`;
}

export function getCardInfo(edition, card) {
  const ed = EDITIONS[edition];
  if (card.type === "risk") return ed.risks.find((r) => r.n === card.n);
  return ed.potentials.find((o) => o.n === card.n);
}
