 const nearest = pipes.find((pipe) => pipe.x + pipeWidth > bird.x);
    if (nearest) {
      const birdCenterX = bird.x + bird.width / 2;
      const birdCenterY = bird.y + bird.height / 2;
      const pipeCenterX = nearest.x + pipeWidth / 2;

      // Arrow to top of gap
      ctx.strokeStyle = "red";
      ctx.beginPath();
      ctx.moveTo(birdCenterX, birdCenterY);
      ctx.lineTo(pipeCenterX, nearest.top);
      ctx.stroke();

      // Arrow to bottom of gap
      ctx.strokeStyle = "blue";
      ctx.beginPath();
      ctx.moveTo(birdCenterX, birdCenterY);
      ctx.lineTo(pipeCenterX, nearest.bottom);
      ctx.stroke();
    }