// const vidoeContainer = document.querySelector('.video-container');






  // Load the IFrame Player API code asynchronously.
  var tag = document.createElement('script');
  tag.src = "https://www.youtube.com/player_api";
  var firstScriptTag = document.getElementsByTagName('script')[0];
  firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

  // Replace the 'player' element with an <iframe> and
  // YouTube player after the API code downloads.
  var player;
  function onYouTubePlayerAPIReady() {
   fetch('/video')
     .then(res => res.json())
     .then(videos => {
      player = new YT.Player('player', {
        // height: '360',
        // width: '640',
        videoId: videos[0]
      });
     })
     .catch(console.error);

  }
 