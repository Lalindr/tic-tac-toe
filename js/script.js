const gameFlowModule = (() =>{
    let player1 = {};
    let player2 = {};
    let activePlayer = '';
    let winner = '';
   const winningCombos = ['012', '345', '678', '036',
                           '147', '258', '048', '642']; 
    const initPlayers = function(mark1, mark2, names, computer){
         if(computer){
            player1 = playerFactory(mark1, names[0].value);
            player2 = Object.assign(playerFactory(mark2, names[1].value), computerFactory());
        }else{
         player1 = playerFactory(mark1, names[0].value);
         player2 = playerFactory(mark2, names[1].value);
    }
        start();
}
const start = function(){
    supplimentaryGameObjectsModule.disableForm();
    activePlayerToggle();
}
const getActivePlayer = function(){
    return activePlayer;
}
const activePlayerToggle = function(){
    if(activePlayer === player2 || activePlayer === ''){
        activePlayer = player1;
    }else{
        activePlayer = player2;
    }
    computerCheck();
    gameBoardModule.updateAnnounce(activePlayer.getName());
   
}
const computerCheck = function(){
    if(activePlayer.getAi()){
        activePlayer.selectField();
    }
}
const getWinner = function(){
    return winner;
}
const backToDefault = function(){
    player1 = {};
    player2 = {};
    activePlayer = '';
}
const checkForTie = function(){
    if(Array.from(gameBoardModule.getCells()).every(cell => cell.textContent !== '')){
        gameBoardModule.updateAnnounce(activePlayer.getName(), 'tie');
        backToDefault();
        supplimentaryGameObjectsModule.ok();
    }
}
const checkForCombo = function(){
    if(activePlayer.getMarkedNumbers().length >= 3){
 for(combo in winningCombos){
 let string = `(.*[${winningCombos[combo]}]){3}`;
     regexp = new RegExp(string);
     if(activePlayer.getMarkedNumbers().join('').match(regexp)){
         gameBoardModule.gameOverOnBoard(winningCombos[combo]);
         winner = activePlayer.getName();
         gameBoardModule.updateAnnounce(activePlayer.getName(), winner);
         backToDefault();
         supplimentaryGameObjectsModule.ok();
         return;
     }
 }
}
     activePlayerToggle();
     checkForTie();
}
    return {initPlayers, activePlayerToggle, getActivePlayer, getWinner, checkForCombo};
})();
const gameBoardModule = (() =>{
    let gameBoard = [];
    const cells = document.querySelectorAll('.gameboard td');
    const announcer = document.querySelector('.announcer');
        function cellListener(e){
            if(gameBoard[e.target.dataset.index]){
                return;
            }
            e.target.textContent = gameBoard[e.target.dataset.index] = gameFlowModule.getActivePlayer().getMark();
            gameFlowModule.getActivePlayer().addNumber(e.target.dataset.index);
            gameFlowModule.checkForCombo();
           
        }
    const initGameBoard = function(){
         gameBoard = ['','','',
                      '','','',
                      '','',''];
       
        cells.forEach((cell) => {
            cell.addEventListener('click', cellListener);
            cell.textContent = '';
        });
        cells.forEach(cell => {
            cell.style.color = 'black';
        });
        }
    const announcerDefault = function(){
        announcer.textContent = "Choose your mark";
    }
    function gameOverOnBoard(markedNumbers){
        for(index in markedNumbers){
            cells[markedNumbers[index]].style.color = 'green';
            cells.forEach(cell => cell.removeEventListener('click', cellListener));
        }
    }
    function updateAnnounce(activePlayer, winner){
        if(winner === 'tie'){
            announcer.textContent = "It's a tie! Press Enter";
            return;
        }else if(winner){
            announcer.textContent = `Game Over! ${activePlayer} wins! Press Enter`;
        }else{
        announcer.textContent = `It's ${activePlayer} turn!`;    
        }
    }
    function getCells(){
        return cells;
    }
    return {initGameBoard,gameOverOnBoard, updateAnnounce, getCells, announcerDefault};
    
})();
const playerFactory = (mark, name) => {
    let markedNumbers = [];
    const getMark = function(){
        return mark
    }
    const addNumber = function(index){
        markedNumbers.push(index);
    }
    const getMarkedNumbers = function(){
        return markedNumbers;
    } 
    const getName = function(){
        return name;
    }
    const getAi = function(){
        if(this.ai){
            return true;
        }
    }
    return {getMark, addNumber, getMarkedNumbers, getName, getAi};
}
const computerFactory = () => {
    const ai = true;
    function selectField(){
        let fieldOfChoice = gameBoardModule.getCells()[Math.floor(Math.random() * 8)];
        function makeAMove(){
            const fakeClick = new Event('click');
            if(fieldOfChoice.textContent){
                selectField();
            }else{
                fieldOfChoice.dispatchEvent(fakeClick);
            }
        }
        makeAMove();
    }
    return {selectField, ai};
}
const supplimentaryGameObjectsModule = (() =>{
    const startButton = document.querySelector('.start-button');
    const names = document.querySelectorAll('input');
    const form = document.querySelector('form');
    let selectedMark = '';
    let unselectedMark = '';
    let computer = false;
    const marks = document.querySelectorAll('.mark');
    const vsAi = document.querySelector('td[colspan="3"]');
    function gameFormInit(){
        startButton.disabled = false;
        gameBoardModule.initGameBoard();
        form.addEventListener('submit', formListener)
        selectedMark = '';
        unselectedMark = '';
        vsAi.classList.remove('vs-ai');
        vsAi.addEventListener('click', vsAiListener);
        computer = false;
        gameBoardModule.announcerDefault();
        names.forEach(name => {name.value=''; name.readOnly = false;});
      marks.forEach(mark => {
          mark.classList.remove('selected');
          mark.addEventListener('click', markListener)
        });
    }
    function formListener(){
        if(!selectedMark.textContent){
            alert("Please, select your mark!");
            return;
        }
        gameFlowModule.initPlayers(selectedMark.textContent, unselectedMark.textContent, names, computer);
    }
    function vsAiListener(e){
        e.target.classList.toggle('vs-ai');
        if(e.target.classList.value.includes('vs-ai')){
            names[1].value = "Computer";
            names[1].readOnly = true;
            computer = true;
        }else{
            names[1].readOnly = false;
            names[1].value = '';
            computer = false;
        }
        
    }
    function disableForm(){
        
        names.forEach(name => name.readOnly = true);
        startButton.disabled = true;
        marks.forEach(mark =>{ 
            mark.removeEventListener('click', markListener);
        });
        form.removeEventListener('submit', formListener);
        startButton.removeEventListener('submit', formListener);
        vsAi.removeEventListener('click', vsAiListener);
    }
    function markListener(e){
        if(selectedMark){
          selectedMark.classList.remove('selected');
        }
        e.target.classList.add('selected');
        selectedMark = e.target;
        unselectedMark = document.querySelector('.setup-table .mark:not(.selected)');
    }
    function ok(){
        window.addEventListener('keydown', (e) => {
            if(e.key === "Enter"){
                gameFormInit();
            }
        })
    }
    gameFormInit();
    return {disableForm, ok};
})();