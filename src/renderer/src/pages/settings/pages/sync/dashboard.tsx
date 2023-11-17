export function Dashboard(props: { setIsLoggedIn: any }) {
  const handleLogout = () => {
    window.indexBridge?.auth.logout(() => {
      console.log('logged out')
      props.setIsLoggedIn(false)
    })
  }
  return (
    <div>
      Logged in
      <button className="bg-s-blue p-2" onClick={() => handleLogout()}>
        Logout
      </button>
    </div>
  )
}
