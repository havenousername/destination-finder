import { StarFilled, StarOutlined } from '@ant-design/icons';
import {useLoadFavourites} from "../hooks/useLoadFavourites";
import {useAuthContext} from "../context/AuthContext";


const FavouriteTag = ({ country }) => {
  const favourites = useLoadFavourites();
  const isFavourite = favourites.favourites?.map(fav => fav.name).includes(country);
  const onClick = async (e) => {
    e.stopPropagation();
    if (!isFavourite) {
      await favourites.add(country, []);
    } else {
      await favourites.remove(country);
    }
  }

  const { user } = useAuthContext();

  if (!user?.id) {
    return;
  }


  return (
    <div className='d-inline' id='favourite'>
      {isFavourite && <StarFilled onClick={onClick}/>}
      {!isFavourite && <StarOutlined onClick={onClick}/>}
    </div>
  )
};

export default FavouriteTag;