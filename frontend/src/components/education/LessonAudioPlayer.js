import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
} from '@mui/material';
import { Pause, PlayArrow, Replay, Stop } from '@mui/icons-material';

const LessonAudioPlayer = ({ audio, topic }) => {
  const [status, setStatus] = useState('idle');
  const [rate, setRate] = useState(1);
  const supported = typeof window !== 'undefined' && 'speechSynthesis' in window;
  const text = useMemo(
    () =>
      audio?.sections?.map((section) => `${section.title}. ${section.text}`).join(' ') ||
      audio?.narrationScript ||
      '',
    [audio]
  );

  useEffect(
    () => () => {
      if (supported) window.speechSynthesis.cancel();
    },
    [supported, text]
  );

  const play = () => {
    if (!supported || !text) return;
    if (status === 'paused') {
      window.speechSynthesis.resume();
      setStatus('playing');
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = audio?.language || 'en-IN';
    utterance.rate = rate;
    const voices = window.speechSynthesis.getVoices();
    utterance.voice =
      voices.find((voice) => voice.lang === 'en-IN') ||
      voices.find((voice) => voice.lang?.startsWith('en')) ||
      null;
    utterance.onend = () => setStatus('finished');
    utterance.onerror = () => setStatus('idle');
    window.speechSynthesis.speak(utterance);
    setStatus('playing');
  };

  const pause = () => {
    window.speechSynthesis.pause();
    setStatus('paused');
  };

  const stop = () => {
    window.speechSynthesis.cancel();
    setStatus('idle');
  };

  if (!supported) {
    return <Alert severity="info">Audio teaching is not supported by this browser.</Alert>;
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Audio class: {topic}
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          Listen hands-free, pause after each concept, and explain it aloud before continuing.
          The narration text comes from the Drive lesson; your browser supplies the voice.
        </Typography>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems="center">
          <Button
            variant="contained"
            startIcon={status === 'finished' ? <Replay /> : <PlayArrow />}
            onClick={play}
            disabled={status === 'playing'}
          >
            {status === 'paused' ? 'Resume' : status === 'finished' ? 'Replay' : 'Play lesson'}
          </Button>
          <Button startIcon={<Pause />} onClick={pause} disabled={status !== 'playing'}>
            Pause
          </Button>
          <Button startIcon={<Stop />} onClick={stop} disabled={status === 'idle'}>
            Stop
          </Button>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Speed</InputLabel>
            <Select
              value={rate}
              label="Speed"
              onChange={(event) => {
                stop();
                setRate(event.target.value);
              }}
            >
              <MenuItem value={0.8}>0.8×</MenuItem>
              <MenuItem value={1}>1×</MenuItem>
              <MenuItem value={1.2}>1.2×</MenuItem>
              <MenuItem value={1.5}>1.5×</MenuItem>
            </Select>
          </FormControl>
        </Stack>

        <Box sx={{ mt: 3, p: 2, bgcolor: 'action.hover', borderRadius: 2 }}>
          <Typography variant="overline">Now playing</Typography>
          <Typography fontWeight="bold">
            {status === 'idle' ? 'Ready to begin' : `${topic} · ${status}`}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default LessonAudioPlayer;
