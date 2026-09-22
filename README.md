# VoidEdit

VoidEdit is a modern desktop video editor built with React, Vite, and Electron.

## Run locally

```bash
npm install
npm run dev
```

## Build Windows EXE

```bash
npm install
npm run build
npm run dist
```

The Windows build produces both:
- an NSIS installer
- a portable Windows executable

Build output is written to `release/`.

## GitHub Actions

Pushing a tag such as `v0.2.0` automatically builds the Windows EXE and attaches the installers to the GitHub Release. A manual build can also be started from the Actions tab.

## Current editor foundation

- Electron desktop shell
- React/Vite interface
- Media import dialog
- Media bin and clip selection
- Multi-track video/audio timeline
- Preview and transport controls
- Inspector controls
- Text, effects, transitions, filters, and audio sections

## Planned editor engine

- Native media decoding and timeline playback
- FFmpeg export pipeline
- Waveforms
- Keyframes
- Captions
- Color controls
- Proxy media
- Project save/load
- GPU-accelerated preview

MIT License.
