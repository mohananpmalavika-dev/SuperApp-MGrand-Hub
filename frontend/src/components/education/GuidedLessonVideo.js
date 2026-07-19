import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  LinearProgress,
  Stack,
  Typography,
} from '@mui/material';
import { ArrowBack, ArrowForward, Pause, PlayArrow, Replay } from '@mui/icons-material';

const GuidedLessonVideo = ({ video, topic }) => {
  const slides = video?.slides || [];
  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (!playing || slides.length < 2) return undefined;
    const timer = window.setInterval(() => {
      setActive((current) => {
        if (current >= slides.length - 1) {
          setPlaying(false);
          return current;
        }
        return current + 1;
      });
    }, 7000);
    return () => window.clearInterval(timer);
  }, [playing, slides.length]);

  if (!slides.length) {
    return <Typography>No guided visual lesson is available for this chapter yet.</Typography>;
  }

  const slide = slides[active];
  const finished = active === slides.length - 1;

  return (
    <Card sx={{ overflow: 'hidden' }}>
      <Box
        sx={{
          minHeight: { xs: 330, md: 430 },
          p: { xs: 3, md: 6 },
          color: 'white',
          background: 'linear-gradient(135deg, #12233f 0%, #165d79 55%, #1f8a70 100%)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}
      >
        <Typography variant="overline" sx={{ opacity: 0.8 }}>
          {topic} · Scene {active + 1} of {slides.length}
        </Typography>
        <Typography variant="h3" fontWeight="bold" sx={{ my: 2 }}>
          {slide.title}
        </Typography>
        <Typography variant="h6" sx={{ whiteSpace: 'pre-line', maxWidth: 800, lineHeight: 1.7 }}>
          {slide.body}
        </Typography>
        <Box sx={{ mt: 4, p: 2, bgcolor: 'rgba(255,255,255,0.12)', borderRadius: 2 }}>
          <Typography variant="body2">
            <strong>Teacher cue:</strong> {slide.cue}
          </Typography>
        </Box>
      </Box>

      <LinearProgress variant="determinate" value={((active + 1) / slides.length) * 100} />
      <CardContent>
        <Stack direction="row" spacing={1} justifyContent="space-between">
          <Button
            startIcon={<ArrowBack />}
            disabled={active === 0}
            onClick={() => setActive((current) => current - 1)}
          >
            Previous
          </Button>
          <Button
            variant="contained"
            startIcon={playing ? <Pause /> : finished ? <Replay /> : <PlayArrow />}
            onClick={() => {
              if (finished) setActive(0);
              setPlaying((current) => !current);
            }}
          >
            {playing ? 'Pause class' : finished ? 'Replay class' : 'Play class'}
          </Button>
          <Button
            endIcon={<ArrowForward />}
            disabled={finished}
            onClick={() => setActive((current) => current + 1)}
          >
            Next
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default GuidedLessonVideo;
