import { AiOutlineMinus } from 'react-icons/ai'
import { BiCheckbox } from 'react-icons/bi'
import { RxCross2 } from 'react-icons/rx'

export default function Actions() {
  const closeWindow = () => {
    window.indexBridge?.window.closeWindow()
  }
  const minWindow = () => {
    window.indexBridge?.window.minWindow()
  }
  const toggleMaxWindow = () => {
    window.indexBridge?.window.toggleMaxWindow()
  }
  return (
    <div className="flex absolute right-0 bg-s-dark-gray">
      <div className="px-4 hover:bg-s-light-gray hover:text-white mr-1" onClick={() => minWindow()}>
        <AiOutlineMinus className="h-[50vh]" size={15} />
      </div>
      <div
        className="px-4 hover:bg-s-light-gray hover:text-white mr-1"
        onClick={() => toggleMaxWindow()}
      >
        <BiCheckbox className="h-[50vh]" size={15} />
      </div>
      <div className="px-4 hover:bg-red-500 hover:text-white" onClick={() => closeWindow()}>
        <RxCross2 className="h-[50vh]" size={15} />
      </div>
    </div>
  )
}
