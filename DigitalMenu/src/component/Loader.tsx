export default function LoadingScreen() {

  return (

    <div className="min-h-dvh flex flex-col items-center justify-center bg-white">

      {/* OUTER CIRCLE */}
      <div
        className="
          w-[72px]
          h-[72px]
          rounded-full
          bg-[#A9B4C2]
          border-2
          border-[#A9B4C2]
          flex
          items-center
          justify-center
        "
      >

        {/* SPINNER */}
        <div
          className="
            w-7
            h-7
            rounded-full
            border-[2.5px]
            border-black/10
            border-t-[#EEF1EF]
            animate-spin
          "
        />

      </div>

      {/* TEXT */}
      <div className="mt-4 text-slate-600 font-medium">
        Loading...
      </div>

    </div>

  );

}   