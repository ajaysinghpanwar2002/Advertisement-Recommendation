import axios from 'axios';
import { SERVER_API } from '../constants';

const sendImage = (imageSrc: string): Promise<any> => {
    return new Promise((resolve, reject) => {
        axios.post(`${SERVER_API}/classification`, { image: imageSrc }, {
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            if (response.data.length > 0) {
                resolve(response.data);
            } else {
                reject('No faces detected brah.');
            }
        })
        .catch(error => reject(error));
    });
};

export default sendImage;