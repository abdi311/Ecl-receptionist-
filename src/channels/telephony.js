// Ponte voce <-> receptionist. NON collegato a nessun numero reale né a servizi a pagamento.
//
// Come funzionerà con un vero provider (es. SIP/Twilio/Vonage + STT/TTS in streaming):
//   1. chiamata in arrivo  -> new VoiceCall(agent) -> call.start() -> TTS del saluto
//   2. trascrizione finale del cliente -> call.onTranscript(text)
//   3. se il cliente inizia a parlare mentre il TTS sta parlando (VAD / trascrizione parziale)
//      -> call.onCallerSpeechStart(): il TTS va fermato subito (barge-in)
//      e il turno successivo viene marcato come interruzione.
//   4. la lingua di ogni risposta (reply.lang) sceglie la voce TTS (fr-CH / it-CH / de-CH / en-GB).

export const VOICES = { fr: 'fr-CH', it: 'it-CH', de: 'de-CH', en: 'en-GB' };

export class VoiceCall {
  constructor(agent, { speak = async () => {}, stopSpeaking = () => {} } = {}) {
    this.agent = agent;
    this.speak = speak; // (text, voice) => Promise — fornito dall'adattatore TTS
    this.stopSpeaking = stopSpeaking;
    this.speaking = false;
    this.interrupted = false;
  }

  async start() {
    return this.#say(this.agent.start());
  }

  onCallerSpeechStart() {
    if (this.speaking) {
      this.stopSpeaking();
      this.speaking = false;
      this.interrupted = true;
    }
  }

  async onTranscript(text) {
    const interrupted = this.interrupted;
    this.interrupted = false;
    const reply = await this.agent.handle(text, { interrupted });
    return this.#say(reply);
  }

  async #say(reply) {
    this.speaking = true;
    try {
      await this.speak(reply.text, VOICES[reply.lang] ?? 'fr-CH');
    } finally {
      this.speaking = false;
    }
    return reply;
  }
}
