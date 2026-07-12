const stages = [
      { icon:'🫵', name:'Command the first two people', desc:'Select an NPC. Order them to gather wood or stone. Watch them move, return and build the first hut. Your basic game loop is alive.', tag:'Playable V1' },
      { icon:'👥', name:'Grow the settlement', desc:'Resources create a new NPC and a second building. Your population grows. Your village starts to look different because of choices you made.', tag:'Population + buildings' },
      { icon:'🎯', name:'Set priorities', desc:'Tell idle NPCs what matters most: food, building or defense. Direct commands still override. Now the civilization begins thinking without constant clicking.', tag:'Smart automation' },
      { icon:'🌩️', name:'Make survival matter', desc:'Food gets used. Resources run out. Weather can slow everyone down. Your decisions now protect the settlement from shrinking.', tag:'Real pressure' },
      { icon:'👾', name:'Defend against monsters', desc:'Creatures attack NPCs and buildings. Command fighters or set a defense policy. The peaceful settlement becomes a dangerous world.', tag:'Combat unlocked' },
      { icon:'⚔️', name:'Face a rival tribe', desc:'A second settlement gathers the same resources and expands nearby. Now your civilization is not alone — and the world starts pushing back.', tag:'Big AI challenge' },
      { icon:'🏰', name:'Build the full living world', desc:'More buildings, more territory, more people and more choices. No final boss. No forced ending. The sandbox keeps growing.', tag:'Open-ended world' }
    ];

    document.querySelectorAll('.stage').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.stage').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const s = stages[Number(btn.dataset.stage)];
        const icon = document.getElementById('stageIcon');
        icon.animate([{transform:'scale(.7) rotate(-8deg)',opacity:.25},{transform:'scale(1)',opacity:1}],{duration:350,easing:'cubic-bezier(.2,.8,.2,1)'});
        icon.textContent = s.icon;
        document.getElementById('stageName').textContent = s.name;
        document.getElementById('stageDesc').textContent = s.desc;
        document.getElementById('stageTag').textContent = s.tag;
      });
    });

    let demoRunning = false;
    const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

    function setCommand(text, run=true) {
      document.getElementById('commandText').textContent = text;
      const bar = document.getElementById('commandBar');
      bar.classList.remove('run');
      void bar.offsetWidth;
      if (run) bar.classList.add('run');
    }

    function makeConfetti() {
      const box = document.getElementById('confetti');
      box.innerHTML = '';
      const colors = ['#56f6ff','#a66bff','#ff5fd2','#97ff82','#ffd66b'];
      for(let i=0;i<36;i++){
        const p=document.createElement('i');
        p.style.background=colors[i%colors.length];
        p.style.setProperty('--x', `${(Math.random()-.5)*520}px`);
        p.style.setProperty('--y', `${-80 + Math.random()*360}px`);
        p.style.setProperty('--r', `${Math.random()*900-450}deg`);
        p.style.animationDelay=`${Math.random()*.12}s`;
        box.appendChild(p);
      }
      box.classList.remove('go'); void box.offsetWidth; box.classList.add('go');
    }

    async function runDemo() {
      if (demoRunning) return;
      demoRunning = true;
      const btn = document.getElementById('demoBtn');
      const n1 = document.getElementById('npc1');
      const n2 = document.getElementById('npc2');
      const hut = document.getElementById('hut');
      const flash = document.getElementById('buildFlash');
      const wood = document.getElementById('wood');
      const stone = document.getElementById('stone');
      const pop = document.getElementById('pop');
      btn.disabled = true;
      btn.textContent = 'WORLD RUNNING…';
      wood.textContent='0'; stone.textContent='0'; pop.textContent='2';
      hut.classList.remove('show');
      n1.style.left='44%'; n1.style.top='54%';
      n2.style.left='52%'; n2.style.top='59%';

      setCommand('SELECT NPC #1'); n1.classList.add('selected');
      await wait(850);
      setCommand('GATHER WOOD'); n1.classList.add('walking');
      n1.style.left='25%'; n1.style.top='38%';
      await wait(1050);
      wood.textContent='2'; setCommand('+2 WOOD (2 / 6)');
      await wait(650);
      n1.style.left='42%'; n1.style.top='54%';
      await wait(1050);
      setCommand('FAST FORWARD: 2 MORE WOOD TRIPS');
      await wait(650); wood.textContent='6';
      n1.classList.remove('walking','selected');

      setCommand('SELECT NPC #2'); n2.classList.add('selected');
      await wait(750);
      setCommand('GATHER STONE'); n2.classList.add('walking');
      n2.style.left='72%'; n2.style.top='43%';
      await wait(1050);
      stone.textContent='1'; setCommand('+1 STONE (1 / 3)');
      await wait(650);
      n2.style.left='53%'; n2.style.top='59%';
      await wait(1050);
      setCommand('FAST FORWARD: 2 MORE STONE TRIPS');
      await wait(650); stone.textContent='3';
      n2.classList.remove('walking','selected');

      setCommand('BUILD FIRST HUT');
      await wait(800);
      hut.classList.add('show');
      flash.classList.remove('flash'); void flash.offsetWidth; flash.classList.add('flash');
      makeConfetti();
      await wait(850);
      pop.textContent='2';
      setCommand('VERSION 1 IS ALIVE!', false);
      btn.textContent = '↻ RUN IT AGAIN';
      btn.disabled = false;
      demoRunning = false;
    }

    // Gentle automatic teaser after the page settles.
    window.addEventListener('load', () => setTimeout(() => {
      const shell = document.querySelector('.world-shell');
      if (shell && shell.getBoundingClientRect().top < window.innerHeight) runDemo();
    }, 1100));
