import { useEffect } from 'react';
import axios from 'axios';

interface AdvertisementProps {
    age: number | null;
    gender: string | null;
}

const Advertisement: React.FC<AdvertisementProps> = ({ age, gender }) => {
    useEffect(() => {
        if (age !== null && gender !== null) {
            axios.post('http://localhost:3000/recommendation', { age, gender })
                .then(response => {
                    // handle the response
                })
                .catch(error => {
                    console.error(error);
                });
        }
    }, [age, gender]);

    return (
        <div className="flex justify-center">
            Advertisement
            {age !== null && <p>Age: {age}</p>}
            {gender !== null && <p>Gender: {gender}</p>}
        </div>
    )
}

export default Advertisement