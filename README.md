# Muse

A journaling prompt generator built with React Native and Expo.

Prompts live in the `prompts` directory. The app will load any of these files in the default prompts list in the sidebar. See [this list](https://github.com/colemanm/muse/blob/main/prompts/40-questions.md)) as an example of how to format your own files.

## Installation

1. Clone the repository:
```bash
git clone https://github.com/colemanm/muse.git
cd muse
```

2. Install dependencies:
```bash
npm install
```

## Development

Run the development server:
```bash
npm start
```

This will start the Expo development server. You can then:
- Press `w` to open in web browser
- Press `i` to open in iOS simulator (requires Xcode)
- Press `a` to open in Android emulator (requires Android Studio)
- Scan the QR code with your phone to open in Expo Go app

## Deployment

The app is configured for deployment on Vercel. To deploy:

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Deploy to Vercel:
```bash
vercel
```

## Project Structure

- `App.tsx` - Main application component
- `prompts.md` - Collection of journaling prompts
- `webpack.config.js` - Webpack configuration for handling markdown files
- `custom.d.ts` - TypeScript declarations
- `app.json` - Expo configuration
- `vercel.json` - Vercel deployment configuration

## License

MIT

## Tech

- React Native
- Expo
- TypeScript
- Vercel

## Future Features

- [ ] Add a "last used" timestamp to each prompt
- [ ] When randomly selecting a prompt, select only from prompts not used in the last 30 days
- [ ] Add your own topics or themes, then use an LLM to generate prompts for each topic, and save them to a custom list

## Sources

Prompts from [this post](https://www.reddit.com/r/Journaling/comments/r7bsmz/long_list_of_journal_prompts/).
