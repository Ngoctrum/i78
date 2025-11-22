const Logo = () => {
  const logoPath = import.meta.env.BASE_URL + 'logo.jpg';
  
  return (
    <div className="flex items-center gap-2">
      <img 
        src={logoPath}
        alt="Ani Shop Logo" 
        className="h-10 w-10 rounded-full object-cover shadow-lg ring-2 ring-primary/20"
      />
      <div className="flex flex-col">
        <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
          Ani Shop
        </span>
        <span className="text-xs text-muted-foreground -mt-1">KTX Services</span>
      </div>
    </div>
  );
};

export default Logo;
