import axios from 'axios';
import { SERVER_API } from '../constants';

const sendImage = (imageSrc: string) => {
    axios.post(`${SERVER_API}/classification`, { image: imageSrc }, {
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => console.log("client side",response))
    .catch(error => console.error(error));
};

export default sendImage;