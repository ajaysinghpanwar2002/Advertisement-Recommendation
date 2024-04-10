import { useState, useEffect } from 'react';
import { WebcamCapture, Advertisement } from './components'

export default function App() {
  const [age, setAge] = useState<number | null>(null);
  const [gender, setGender] = useState<string | null>(null);

  const handleFacesDetected = (faces: Array<{ gender: string, Age: number }>) => {
    if (faces.length > 0) {
      const newGender = faces[0].gender;
      const newAge = faces[0].Age;

      if (newGender !== gender || (newAge - age! > 3 || newAge - age! < -3)) {
        setAge(newAge);
        setGender(newGender);
      }
    } else {
      console.log("No faces detected.");
    }
  };

  useEffect(() => {
    if (age !== null || gender !== null) {
      // send age, gender to Advertisement component
    }
  }, [age, gender]);

  return (
    <div>
      <div className='flex justify-between h-screen'>
        <div className=''>
          <Advertisement age={age} gender={gender} />
        </div>
        <div className='flex justify-end items-end'>
          <WebcamCapture onFacesDetected={handleFacesDetected} />
        </div>
      </div>
    </div>
  )
}