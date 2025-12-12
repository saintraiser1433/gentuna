# Sound Effects Directory

This directory is for storing sound effect and music files used in the Lucky Draw system.

## Supported File Formats

- MP3 (recommended)
- WAV
- OGG
- M4A
- Any audio format supported by HTML5 Audio API

## Sound Files

### Draw Start Sound Effect
- **Purpose**: Plays when the draw animation starts (both vertical and wheel modes)
- **Recommended**: Short sound effect (1-3 seconds)
- **Examples**: 
  - Spinning wheel sound
  - Drum roll
  - Whoosh sound
  - Click/beep sound

### Winner Modal Music
- **Purpose**: Plays when the winner modal appears
- **Recommended**: Background music that loops (10-30 seconds)
- **Examples**:
  - Victory fanfare
  - Celebration music
  - Upbeat background music
  - Triumph music

## How to Add Sound Files

1. **Place files in this directory**: Copy your audio files to `public/sounds/`
2. **Configure in Settings**: 
   - Go to Settings → Sound Settings
   - Either:
     - Enter the file path (e.g., `/sounds/draw-start.mp3`)
     - Or use the file upload button to select a file (will be stored as data URL)

## File Naming Suggestions

- `draw-start.mp3` - Sound effect for draw start
- `winner-music.mp3` - Music for winner modal
- `spin-sound.mp3` - Alternative draw start sound
- `celebration.mp3` - Alternative winner music

## Notes

- Files placed in `public/sounds/` can be accessed via URL: `/sounds/filename.mp3`
- Uploaded files are stored as data URLs in browser localStorage
- For best performance, keep sound files under 1MB
- Use MP3 format for best browser compatibility

