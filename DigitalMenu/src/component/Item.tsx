import type { itemT } from "../types"

type ItemProps = {
    itemStructure:itemT;
    index:number;
    primaryColor:string;
    accentColor:string;
}

const Item = ({itemStructure,index,primaryColor,accentColor}:ItemProps) => {
  return (
    
              <div
                key={index}
                className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow"
              >

                <div className="flex justify-between items-start mb-2">

                  <h3
                    className="text-xl font-semibold"
                    style={{
                      color:
                        primaryColor
                    }}
                  >
                    {itemStructure.name}
                  </h3>


                  {itemStructure.price && !itemStructure.variants && (

                    <span
                      className="text-xl font-bold ml-4 whitespace-nowrap"

                      style={{
                        color:
                          accentColor
                      }}
                    >
                      ₹{itemStructure.price}
                    </span>

                  )}

                </div>


                <p className="text-slate-600 mb-3">
                  {itemStructure.description}
                </p>


                {/* VARIANTS */}
                {itemStructure.variants && (

                  <div className="flex flex-wrap gap-3 mt-4">

                    {itemStructure.variants.map((variant, vIndex) => (

                      <div
                        key={vIndex}

                        className="flex items-center gap-2 px-4 py-2 rounded-full border-2"

                        style={{
                          borderColor:
                           accentColor,

                          backgroundColor:
                            `${accentColor}10`
                        }}
                      >

                        <span
                          className="text-sm font-medium"

                          style={{
                            color:
                              primaryColor
                          }}
                        >
                          {variant.name}
                        </span>


                        <span
                          className="text-sm font-bold"

                          style={{
                            color:
                              accentColor
                          }}
                        >
                          ₹{variant.price}
                        </span>

                      </div>

                    ))}

                  </div>

                )}

              </div>

  )
}

export default Item