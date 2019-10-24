class RoomClient {

  init = null;

  constructor(apikey = '') {
    const headers = new Headers();
    headers.append('Authorization', apikey);
   
    this.init = {
      method: 'GET',
      headers: headers,
      mode: 'cors',
      cache: 'default'
    };
  }

  openRoom = async () => {
    const init = {...this.init, method: 'POST'}
    
    const request = new Request('https://api.eyeson.team/rooms?user[name]=Ezequiel Medrano&options[show_names]=false', init);
    const response = await fetch(request);
    
    return await response.json();
  }
  
  getRoomInfo = async (roomId) => {
    const request = new Request(`https://api.eyeson.team/rooms/${roomId}`, this.init);
    const response = await fetch(request);
    
    return await response.json();
  }

  getRecordingsInfo = async (recordingId) => {
    const request = new Request(`https://api.eyeson.team/recordings/${recordingId}`, this.init);
    const response = await fetch(request);
    
    return await response.json();
  }
}

export default RoomClient;