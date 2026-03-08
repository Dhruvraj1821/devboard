export default function LandingPage(){
    const handleLogin = () => {
        window.location.href = 'http://localhost:5000/api/auth/github'
    }
    return (
        <div style={{textAlign: 'center', marginTop: '100px'}}>
            <h1>DevBoard</h1>
            <p>Your GitHub analytics dashboard</p>
            <button onClick={handleLogin}>Login with Github</button>
        </div>
    )
}