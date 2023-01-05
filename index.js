/* eslint-disable max-len */
// -----------ADD FUNCTION TO HAMBURGER MENU BAR------------
const body = document.querySelector('body');
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('active');
  navMenu.classList.toggle('active');
});

document.querySelectorAll('.nav-link').forEach((n) => n.addEventListener('click', () => {
  hamburger.classList.remove('active');
  navMenu.classList.remove('active');
}));
// -----------REFACTOR PROJECT SECTION----------------

// Store project information in array

const see = document.querySelector('.buttonP');
see.addEventListener('click', () => {
  const main = document.createElement('div');
  main.className = 'main-pop';
  const popup = document.createElement('div');
  popup.className = 'card-pop';
  popup.innerHTML = `
  <h5 class="card-title-pop">Tonic<i class="fas fa-times fa-2xs"></i></h5>
  <ul class="card-list-pop">
    <li class="card-text">CANOPY</li>
    <li class="dot"></li>
    <li class="dev">Back End Dev</li>
    <li class="dot"></li>
    <li class="year">2015</li>
    </ul>
  <img id="one" class="card-img-pop" src="vectors/snap.png" alt="Tonic project snapshot">
  <div class="left-block">
  <div class="card-body">
              
      <p class="text-pop">Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essent</p>
     <ul class="tags-pop">
     <li id="html"><a href="#" class="tags button1">html</a></li>
     <li id="css"><a href="#" class="tags button2">css</a></li>
     <li id="js"><a href="#" class="tags button3">javascript</a></li>
     </ul> 
      <hr id="hr-pop">
     <div class="project-pop">
      <a id="proj" href="#" class="button" >See live &nbsp;<img src="vectors/Icon.png"></a>
     </div>
     <div class="project-pop2">
      <a id="proj" href="#" class="button" >See Source &nbsp;<img src="vectors/git.png"></a>
     </div>
    </div>

  </div>
  
  `;
  main.appendChild(popup);
  body.appendChild(main);

  const close = document.querySelector('.fa-times');
  close.addEventListener('click', () => {
    body.removeChild(main);
  });
});

const open = document.querySelector('.project');

open.addEventListener('click', () => {
  const mains = document.createElement('div');
  mains.className = 'main-pops';
  const dPopup = document.createElement('div');
  dPopup.className = 'card-pops';
  dPopup.innerHTML = `
  <h5 class="card-title-pops">Tonic<i class="fas fa-times fa-2xs"></i></h5>
  <ul class="card-list-pops">
    <li class="card-text">CANOPY</li>
    <li class="dot"></li>
    <li class="dev">Back End Dev</li>
    <li class="dot"></li>
    <li class="year">2015</li>
    </ul>
  
  <img id="two" class="card-img-pops" src="vectors/snap20.png" alt="Tonic project snapshot">

  <div class="left-block">
  <div class="card-body">
    <div class="row ">
      <div class="col-8">
      <p class="text-pops">Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it 1960s with the releaLorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it 1960s with the releorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum han printer took a galley of type and scrambled it 1960s with the releawn printer took a galley of type and scrambled it 1960s with the releaLorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it 1960s with the relea</p>
    </div>
    <div class="col-4">
    <ul class=" row tags-pops">
    <div class="row" >
      <div class="col"><li id="html"><a href="#" class="tags button1">html</a></li></div>
      <div class="col"><li id="css-pop"><a href="#" class="tags button2">css</a></li></div>
      <div class="col"> <li id="js-pop"><a href="#" class="tags button3">javascript</a></li></div>
     </div>
    <div class="row">
      <div class="col"><li id="git"><a href="#" class=" button3">github</a></li></div>
        <div class="col"><li id="ruby"><a href="#" class=" button3">ruby</a></li></div>
          <div class="col"><li id="bs"><a href="#" class=" button3">Bootstraps</a></li></div>
    </div>
     </ul> 
     <hr id="hr-pop">
     <div class="project-pop">
      <a id="projp" href="#" class="button" >See live &nbsp;<img src="vectors/Icon.png"></a>
     </div>
     <div class="project-pop2">
      <a id="projp" href="#" class="button" >See Source &nbsp;<img src="vectors/git.png"></a>
     </div>
    </div>
    </div>
  </div>
  </div>
  
  `;
  mains.appendChild(dPopup);
  body.appendChild(mains);

  const close = document.querySelector('.fa-times');
  close.addEventListener('click', () => {
    body.removeChild(mains);
  });
});

// eslint-disable-next-line no-lone-blocks
{ /* <div id="uno" class="card-pop">
<h5 class="card-title-pop">Tonic<i class="fas fa-times"></i></h5>
<ul class="card-list-pop">
  <li class="card-text">CANOPY</li>
  <li class="dot"></li>
  <li class="dev">Back End Dev</li>
  <li class="dot"></li>
  <li class="year">2015</li>
  </ul>
<img id="one" class="card-img" src="vectors/snap.png" alt="Tonic project snapshot">
<div class="left-block">
<div class="card-body">
 <p class="text">Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essent</p>
   <ul class="tags-pop">
   <li id="html"><a href="#" class="tags button1">html</a></li>
   <li id="css"><a href="#" class="tags button2">css</a></li>
   <li id="js"><a href="#" class="tags button3">javascript</a></li>
   </ul>
    <hr id="hr-pop">
   <div class="project-pop">
    <a id="proj" href="#" class="button" >See live &nbsp;<img src="vectors/Icon.png"></a>
   </div>
   <div class="project-pop2">
    <a id="proj" href="#" class="button" >See Source &nbsp;<img src="vectors/git.png"></a>
   </div>
  </div>

</div>
</div> */ }