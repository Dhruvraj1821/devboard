export default function Dashboard() {
    const token = localStorage.getItem('devboard_token')
    return(
        <div style={{textAlign: 'center', marginTop: '100px'}}>
            <h1>Dashboard</h1>
            {token
                ? <p>You are logged in. Token found in localstorage</p>
                : <p>No token found</p>
            }
        </div>
    )
}