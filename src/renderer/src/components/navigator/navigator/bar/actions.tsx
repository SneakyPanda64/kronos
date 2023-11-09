import { BiLeftArrow, BiRightArrow, BiRefresh } from 'react-icons/bi'

export default function Actions() {
  return (
    <div className="flex ml-4">
      <div className="my-auto hover:bg-s-light-gray rounded-md p-2 hover:text-white">
        <BiLeftArrow />
      </div>
      <div className="my-auto ml-2 hover:bg-s-light-gray rounded-md p-2 hover:text-white">
        <BiRightArrow />
      </div>
      <div className="my-auto ml-2 hover:bg-s-light-gray p-1 rounded-md hover:text-white">
        <BiRefresh size={22} />
      </div>
    </div>
  )
}
