
let i=0, my_username = '';	
const socket = io();		

// se ejecuta una vez que el DOM esté cargado
// se crea una nueva instancia de la clase MainChat, que tiene los métodos del chat
$(document).ready( () => {	
	new MainChat();
});

class MainChat  {
	constructor () {
		// mCustomScrollbar() es un plugin de jQuery para configurar scrollbars
		$('.messages-content').mCustomScrollbar();
		MainChat.LoadEventHandlers();		
	}	
	
	// la hora que aparece debajo de cada mensaje
	static setDate(){
	  let d = new Date();
	  let m = d.getMinutes().toString().padStart(2, '0');
	  $('<div class="timestamp">' + d.getHours() + ':' + m + '</div>').appendTo($('.message:last'));
	}
	
	static insertMessage() {
		// comprobamos si el valor encontrado en la clase message-input existe (para no generar burbujas de texto vacías)
	  const msg = $('.message-input').val();
	  if ($.trim(msg) == '') {
		return false;
	  }
	  // vaciamos el espacio del input
	  $('.message-input').val(null);
	  MainChat.updateScrollbar();
	  socket.emit('sendchat', msg);
	}
		
	static LoadEventHandlers() {
			$('.chat-title').on('click', () => {
				if ( $('.chat').height() == 500 )
					$( '.chat' ).animate({ height: 45 }, 1000 );
				else 
					$( '.chat' ).animate({ height: 500 }, 1000 );
				
				$('.message-box').slideToggle(300, 'swing');
				$('.chat-message-counter').fadeToggle(300, 'swing');
			});
			
			$('.message-submit').click( () => {
			  MainChat.insertMessage();
			});
			
			// se verifica con jQuery si se ha dado "enter" (el código de enter es 13), keydom es el evento de presionar una tecla
			$(window).on('keydown', e => {
			  if (e.which == 13) {
				MainChat.insertMessage();
				// ponemos falso para que no se ejecute nada más, evitamos la generación de un salto de línea
				return false;
			  }
			});
			
			// cuando se recibe el evento updatechat se actualiza el cuerpo del chat
			socket.on('updatechat',  (username, data) => {
				// Se define un nombre de usuario que ingresado en el prompt permita interactuar con el usuario
				// todavia estoy investigando como empalmar esto con una base de datos y hacer que las vistas del chat por usuario sean diferentes.
				if(username == 'Usuario123'){
					// mCSB_container es una clase del plugin mCustomScrollbar (nos ayuda a identificar el contenedor principal
					// donde se está el contenido al que se le aplica la configuración de la scrollbar)
					$('<div class="message loading new"><figure class="avatar"><img src="/public/img/sa.png" /></figure><span></span></div>').appendTo($('.mCSB_container'));
					MainChat.updateScrollbar();
					// seteamos un timeout para emular la carga de un mensaje (podríamos usar un tiempo aleatorio si queremos hacerlo más realista)
					setTimeout( () => {
						//se remueve la animación de carga de mensaje
					$('.message.loading').remove();
					$('<div class="message new"><figure class="avatar"><img src="/public/img/sa.png" /></figure>' + data + '</div>').appendTo($('.mCSB_container')).addClass('new');
						MainChat.setDate();
						MainChat.updateScrollbar();
					}, 1000);
				} else {	
					setTimeout( () => {
					$('.message.loading').remove();
					$('<div class="message message-personal">' + data + '</div>').appendTo($('.mCSB_container')).addClass('new');
						MainChat.setDate();
						MainChat.updateScrollbar();
					}, 1000);
				}
			});
			
			//cada vez que el servidor emite un evento 'msg_user_handle'se actualiza el cuerpo del chat
			socket.on('msg_user_handle', (username, data) => {
				setTimeout( () => {
				$('.message.loading').remove();
				$('<div class="message message-personal">' + data + '</div>').appendTo($('.mCSB_container')).addClass('new');
					MainChat.setDate();
					MainChat.updateScrollbar();
				}, 1000);
			});
			
			// apenas se conecte el servidor, se pide al usuario dar su nombre en un prompt
			socket.on('connect', () => {
				socket.emit('adduser', prompt("What's your name?"))
			});
			
			// Cuando el servidor emite un evento 'msg_user_found' se genera un prompt para dar un nombre de username
			socket.on('msg_user_found', username => {
				socket.emit('msg_user', username, my_username, prompt("Type your message:"))
			});
			
			
			// cuandi el servidor emite un evento store_username, se actualiza el username
			socket.on('store_username', username => {
				my_username = username
			});
	}
	
	// configuración de la barra de scroll
	static updateScrollbar() {
		$('.messages-content').mCustomScrollbar("update").mCustomScrollbar('scrollTo', 'bottom', {
			scrollInertia: 10,timeout: 0
		});
	}
	
	//Se verifica el usuario, para determinar las burbujas de mensaje 
	static sendmsg (id) { 
		socket.emit('check_user', my_username, id);
	}
}










