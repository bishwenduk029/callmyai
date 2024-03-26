import { keyboard } from '@nut-tree/nut-js';

    
(async () => {
    keyboard.config.autoDelayMs = 2
    await keyboard.type("I'm sorry, but I'm not quite sure what you're asking for. Could you please clarify what you mean by 'one bug sentence'? Are you looking for an example of a sentence that contains a bug or error in it?");
    // We can even type special characters
    await keyboard.type('🎉');
})();