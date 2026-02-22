import Image from "next/image"

const DashboardBackground = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
      
      {/* KONTEJNER SLIKE */}
      <div className="absolute w-[120%] h-[120%] bottom-[-10%] right-[-13%] opacity-25">
        <Image
          src="/N&N-Auto2.webp" 
          alt="Pozadina"
          fill
          priority
          className="object-contain" 
        />
        
        {/* FADE EFEKTI (Tailwind v4 bg-linear-to syntax) */}
        {/* Gradijent odozdo ka gore */}
        <div className="absolute inset-0 bg-linear-to-t from-background via-transparent to-transparent" />
        {/* Gradijent sdesna ulevo */}
        <div className="absolute inset-0 bg-linear-to-l from-background via-transparent to-transparent" />
        {/* Glavni fade sloj koji "utapa" sliku u pozadinu dashboarda */}
        <div className="absolute inset-0 bg-linear-to-b from-background via-background/85 to-background" />
      </div>
    </div>
  )
}

export default DashboardBackground