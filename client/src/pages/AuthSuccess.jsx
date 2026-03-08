import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
export default function AuthSuccess() {
    const navigate = useNavigate()

    useEffect(() => {
        const params = new URLSearchParams(window.location.search)
        const token = params.get('token')

        if(token){
            localStorage.setItem('devboard_token', token)
            navigate('/dashboard', {replace: true})
        } else {
            navigate('/', {replace: true})
        }
    }, [navigate])
    return (
        <div style={{textAlign: 'center', marginTop: '100px'}}>
            <p>Logging you in...</p>
        </div>
    )
}