const peopleInfo = document.querySelector('.people-info');
fetch('/wiki/')
  .then(res => res.json())
  .then(doc => {
      if(doc[2].length){
        peopleInfo.innerHTML = `<p>${doc[2]} <a href=${doc[3]} target="_blank">(Wikipedia)</a><p/>`;
      
    }
  })
  .catch(console.error);