export const AddSupplierForm = () => {
  return (
    <form className="h-full flex flex-col justify-between">
      <div className="flex flex-col space-y-4 mb-auto">
        {/* SUPPLIER NAME */}
        <div className="flex w-full justify-between gap-4">
          {/* FIRST NAME */}
          <div className="flex flex-col w-full">
            <label htmlFor="firstName" className="block text-sm font-medium">
              First Name
            </label>
            <input
              id="firstName"
              type="text"
              className="w-full drop-shadow-none bg-custom-gray p-2"
              // {...register("firstName")}
            />
            <span className="text-red-500 text-xs normal-case">
              {/* {errors.productName?.message} */}
            </span>
          </div>

          {/* LAST NAME */}
          <div className="flex flex-col w-full">
            <label htmlFor="lastName" className="block text-sm font-medium">
              Last Name
            </label>
            <input
              id="lastName"
              type="text"
              className="w-full drop-shadow-none bg-custom-gray p-2"
              // {...register("firstName")}
            />
            <span className="text-red-500 text-xs normal-case">
              {/* {errors.productName?.message} */}
            </span>
          </div>
        </div>

        <div className="flex w-full justify-between gap-4">
          <div className="flex flex-col w-full">
            <label htmlFor="emailAddress" className="block text-sm font-medium">
              Email Address
            </label>
            <input
              id="emailAddress"
              type="text"
              className="w-full drop-shadow-none bg-custom-gray p-2"
              // {...register("productCode")}
            />
            <span className="text-red-500 text-xs normal-case">
              {/* {errors.productCode?.message} */}
            </span>
          </div>

          <div className="flex flex-col w-full">
            <label
              htmlFor="contactNumber"
              className="block text-sm font-medium"
            >
              Contact Number
            </label>
            <input
              id="contactNumber"
              type="text"
              className="w-full drop-shadow-none bg-custom-gray p-2"
              // {...register("productCode")}
            />
            <span className="text-red-500 text-xs normal-case">
              {/* {errors.productCode?.message} */}
            </span>
          </div>
        </div>

        {/* COMPANY NAME */}
        <div className="flex flex-col w-full">
          <label htmlFor="companyName" className="block text-sm font-medium">
            Company Name
          </label>
          <input
            id="companyName"
            type="text"
            className="w-full drop-shadow-none bg-custom-gray p-2"
            // {...register("productCode")}
          />
          <span className="text-red-500 text-xs normal-case">
            {/* {errors.productCode?.message} */}
          </span>
        </div>

        {/* DESCRIPTION */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium">
            Supplier Notes
          </label>
          <textarea
            id="description"
            className="w-full p-2 rounded-lg "
            // {...register("description")}
          />
          <span className="text-red-500 text-xs normal-case">
            {/* {errors.description?.message} */}
          </span>
        </div>
      </div>

      <button>Add Supplier</button>
    </form>
  );
};
