import { useEffect, useState } from 'react';
import axios from 'axios';

interface AdvertisementProps {
    age: number | null;
    gender: string | null;
}

const Advertisement: React.FC<AdvertisementProps> = ({ age, gender }) => {
    const [adClass, setAdClass] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    useEffect(() => {
        if (age !== null && gender !== null) {
            setIsLoading(true);
            axios.post('http://localhost:3000/recommendation', { age, gender })
                .then(response => {
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument
                    setAdClass(response.data.advertisement_class);
                })
                .catch(error => {
                    console.error(error);
                })
                .finally(() => {
                    setIsLoading(false);
                });
        }
    }, [age, gender]);

    return (
        <div className="flex justify-center" style={{ flexDirection: 'column' }}>
            <p>Advertisement</p>
            {age !== null && <p style={{ marginTop: '1em' }}>Age: {age}</p>}
            {gender !== null && <p style={{ marginTop: '1em' }}>Gender: {gender}</p>}
            {isLoading && <p style={{ marginTop: '1em' }}>Loading...</p>}
            {adClass !== null && <p style={{ marginTop: '1em' }}>Recommended Class: {adClass}</p>}
        </div>
    )
}

export default Advertisement;