import { WebcamCapture, Advertisement } from './components'

export default function App() {
  return (
    <div>
      <div className='flex justify-between h-screen'>
        <div className='w-11/12'>
          <Advertisement />
        </div>
        <div className='flex w-1/12 justify-end items-end'>
          <WebcamCapture />
        </div>
      </div>
    </div>
  )
}