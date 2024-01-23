import axios from 'axios';
import { SERVER_API } from '../constants';

const sendImage = (imageSrc: string) => {
    axios.post(`${SERVER_API}`, { image: imageSrc })
        .then(response => console.log(response))
        .catch(error => console.error(error));
};

export default sendImage;