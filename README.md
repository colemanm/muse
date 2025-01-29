# Muse

A journaling prompt generator built with React Native and Expo.

Prompts live in the `prompts.md` file in the root directory. Edit this file to include or replace with your own prompts.

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

## Features

- Displays a single prompt at a time
- Prompts are stored in a markdown file, each one as a bullet
- "Dice roll" button for randomly selecting a single prompt to display
- "Show full list" option to see the archive of all prompts

## Tech

- React Native
- Expo
- TypeScript
- Vercel

## Future Features

- Upload your own prompts from a file
- Sign in with Google to save your prompts
- Save authenticated users' prompts to a database
- Mark a prompt as "used"
- Add a "last used" timestamp to each prompt
- When randomly selecting a prompt, select only from prompts not used in the last 30 days
- Add your own topics or themes, then use an LLM to generate prompts for each topic, and save them to a custom list
- Store different lists of prompts for different purposes or themes

## Sources

Prompts from [this post](https://www.reddit.com/r/Journaling/comments/r7bsmz/long_list_of_journal_prompts/).