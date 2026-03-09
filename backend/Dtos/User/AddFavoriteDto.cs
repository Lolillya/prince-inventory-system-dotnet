using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations;

namespace backend.Dtos.User
{
    public class AddFavoriteDto
    {
        [Required]
        public int Product_ID { get; set; }
    }
}
