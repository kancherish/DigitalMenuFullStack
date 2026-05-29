
type HeaderProps = {
  color:string;
  name:string;
  tagline:string
}
const Header = ({color,name,tagline}:HeaderProps) => {
  return (
   <>
      <div 
        className="text-white py-12 px-6 text-center shadow-lg"
        style={{ backgroundColor: color }}
      >
        <h1 className="text-4xl font-bold mb-2">{name}</h1>
        <p className="text-lg opacity-90">{tagline}</p>
      </div>
   </>
  )
}

export default Header