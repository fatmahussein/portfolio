/* eslint-disable prefer-destructuring */
/* eslint-disable no-restricted-syntax */
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
const projects = [
  {
    name: 'Tonic',
    description: 'A daily selection of privately personalized reads; no accounts or sign-ups required.',
    Mobimage: 'vectors/snap.png',
    id: 'uno',
    Desktimage: 'vectors/snap20.png',
    technologies: ['html', 'css', 'javascript'],
    live: 'https://fatmahussein.github.io/portfolio/',
    source: 'https://fatmahussein.github.io/portfolio/',
    company: 'CANOPY',
  },
  {
    name: 'Multi-Post Stories',
    description: 'A daily selection of privately personalized reads; no accounts or sign-ups required.',
    Desktimage: 'vectors/snap4.png',
    id: 'swap2',
    Mobimage: 'vectors/snap2.png',
    technologies: ['html', 'css', 'javascript'],
    live: '#',
    source: '#',
    company: 'FACEBOOK',
  },

  {
    name: 'Facebook 360',
    description: 'Exploring the future of media in Facebook first Virtual Reality app; a place to discover and enjoy 360 photos and videos on Gear VR.',
    Desktimage: 'vectors/snap.png',
    id: 'desktp',
    technologies: ['html', 'css', 'javascript'],
    live: '#',
    source: '#',
    company: 'FACEBOOK',
  },
  {
    name: 'Uber Navigation',
    description: 'A smart assistant to make driving more safe, efficient, and fun by unlocking your most expensive computer: your car.',
    Desktimage: 'vectors/snap2.png',
    technologies: ['html', 'css', 'javascript'],
    id: 'swap',
    live: '#',
    source: '#',
    company: 'UBER',
  },
  {
    name: 'Tonic',
    description: 'A daily selection of privately personalized reads; no accounts or sign-ups required.',
    Mobimage: 'vectors/snap3.png',
    technologies: ['html', 'css', 'javascript'],
    id: 'yoga',
    live: '#',
    source: '#',
    company: 'CANOPY',
  },
  {
    name: 'Multi-Post Stories',
    description: 'A daily selection of privately personalized reads; no accounts or sign-ups required.',
    Desktimage: 'vectors/snap4.png',
    id: 's',
    Mobimage: 'vectors/snap4.png',
    technologies: ['html', 'css', 'javascript'],
    live: '#',
    source: '#',
    company: 'FACEBOOK',
  },

];

const projectsContainer = document.querySelector('.grid-item');
for (const project of projects) {
  // Create the card
  const card = document.createElement('div');
  card.classList.add('card');
  card.setAttribute('id', project.id);
  // Create the image
  const image = document.createElement('img');

  if (window.innerWidth < 768) {
    image.classList.add('card-img');
    image.src = project.Mobimage;
  } else if (window.innerWidth > 768) {
    image.classList.add('card-img');
    image.setAttribute('id', 'two');
    image.src = project.Desktimage;
  }
  card.appendChild(image);
  // Create the left block

  const leftBlock = document.createElement('div');
  leftBlock.classList.add('left-block');
  card.appendChild(leftBlock);
  // Create the card body
  const cardBody = document.createElement('div');
  cardBody.classList.add('card-body');
  leftBlock.appendChild(cardBody);
  // Create the card title
  const cardTitle = document.createElement('h5');
  cardTitle.classList.add('card-title');
  cardTitle.textContent = project.name;
  cardBody.appendChild(cardTitle);
  // Create the card list
  const cardList = document.createElement('ul');
  cardList.classList.add('card-list');
  //   cardList.setAttribute('id','lis');
  cardBody.appendChild(cardList);
  // Create the card text
  const cardText = document.createElement('li');
  cardText.classList.add('card-text');
  cardText.textContent = project.company;
  // technologies.join(', ');
  cardList.appendChild(cardText);
  // Create the dot
  const dot = document.createElement('li');
  dot.classList.add('dot');
  cardList.appendChild(dot);
  // Create the dev
  const dev = document.createElement('li');
  dev.classList.add('dev');
  if (project.name === 'Tonic') {
    dev.textContent = 'Back End Dev';
  } else if (project.name === 'Multi-Post Stories' || project.name === 'Facebook 360') {
    dev.textContent = 'Full Stack Dev';
  } else if (project.name === 'Uber Navigation') {
    dev.textContent = 'Lead Developer';
  }
  cardList.appendChild(dev);
  // Create the dot
  const dots = document.createElement('li');
  dots.classList.add('dot');
  cardList.appendChild(dots);
  // Create the year
  const year = document.createElement('li');
  year.classList.add('year');
  year.textContent = '2015';
  cardList.appendChild(year);
  // Create the card description
  const cardDescription = document.createElement('p');
  cardDescription.classList.add('text');
  cardDescription.textContent = project.description;
  cardBody.appendChild(cardDescription);
  // create tags list
  const ul = document.createElement('ul');
  ul.classList.add('tags');
  cardBody.appendChild(ul);
  // create li
  const btn1 = document.createElement('li');
  btn1.classList.add('button1');
  btn1.textContent = project.technologies[0];
  ul.appendChild(btn1);
  // create li
  const btn2 = document.createElement('li');
  btn2.classList.add('button2');
  btn2.textContent = project.technologies[1];
  ul.appendChild(btn2);
  // create li
  const btn3 = document.createElement('li');
  btn3.classList.add('button3');
  btn3.textContent = project.technologies[2];
  ul.appendChild(btn3);
  // create button
  const proj = document.createElement('div');

  if (window.innerWidth < 768) {
    proj.classList.add('project');
    const bt = document.createElement('a');
    bt.classList.add('button');
    bt.textContent = 'see project';
    bt.setAttribute('id', 'proj');
    proj.appendChild(bt);
  } else if (window.innerWidth > 768) {
    proj.classList.add('project-Desktop');
    const bt = document.createElement('a');
    bt.classList.add('button');
    bt.textContent = 'see project';
    bt.setAttribute('id', 'proj');
    proj.appendChild(bt);
  }
  cardBody.appendChild(proj);
  projectsContainer.appendChild(card);
}
window.addEventListener('resize', () => this.location.reload());

// modal
const see = document.querySelector('.project');
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

const open = document.querySelector('.project-Desktop');

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